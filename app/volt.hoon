::
/-  *volt, *bolt, bc=bitcoin
/+  default-agent, dbug, volt, bolt
::
|%
+$  card  card:agent:gall
::
+$  versioned-state
  $%  state-0
  ==
::
+$  state-0
  $:  %0
      prov=(unit ship)
      conf=config
      peers=(map ship peer)
      keys=keyr
  ==
--
::
%-  agent:dbug
::
=|  state-0
=*  state  -
^-  agent:gall
=<
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %|) bowl)
    hc    ~(. +> bowl)
::
++  on-init
  ^-  (quip card _this)
  ~&  >  '%volt agent initialized successfully'
  `this(state *state-0)
::
++  on-save
  ^-  vase
  !>(state)
::
++  on-load
  |=  old-state=vase
  ^-  (quip card _this)
  ~&  >  '%volt agent recompiled successfully'
  `this(state !<(versioned-state old-state))
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  =^  cards  state
    ?+    mark  (on-poke:def mark vase)
        %volt-client-command
      ?>  =(our.bowl src.bowl)
      (handle-command:hc !<(command vase))
    ::
        %volt-client-action
      ?<  =(our.bowl src.bowl)
      (handle-action:hc !<(action vase))
    ::
        %bolt-message
      (handle-message:hc !<(message vase))
    ==
  [cards this]
::
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  `this
::
++  on-watch
  |=  =path
  ^-  (quip card _this)
  `this
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+    -.sign  (on-agent:def wire sign)
      %kick
    ?~  prov  `this
    ?:  ?&  ?=(%set-provider -.wire)
            =(u.prov src.bowl)
        ==
      :_  this
      ~[(sub-provider u.prov)]
    `this
  ::
      %fact
    =^  cards  state
      ?+    p.cage.sign  `state
          %volt-provider-status
        `state
      ::
          %volt-provider-update
        `state
      ::
          %btc-provider-status
        `state
      ::
          %btc-provider-update
        `state
      ==
    [cards this]
  ::
      %watch-ack
    ?:  ?=(%set-provider -.wire)
      ?~  p.sign
        `this
      =/  =tank  leaf+"subscribe to provider {<dap.bowl>} failed"
      %-  (slog tank u.p.sign)
      `this(prov ~)
    `this
  ==
::
++  on-peek   on-peek:def
++  on-leave  on-leave:def
++  on-fail   on-fail:def
--
::
|_  =bowl:gall
++  handle-action
  |=  =action
  |^  ^-  (quip card _state)
  ?-    -.action
      %settle-htlc
    `state
  ::
      %fail-htlc
    `state
  ==
  ++  settle-htlc
    |=  [htlc=htlc-info =preimage]
    ^-  card
    %-  poke-provider  [%settle-htlc htlc preimage]
  ::
  ++  fail-htlc
    |=  htlc=htlc-info
    ^-  card
    %-  poke-provider  [%fail-htlc htlc]
  --
::
++  handle-command
  |=  =command
  ^-  (quip card _state)
  ?-    -.command
      %set-provider
    =/  sub-card=card  (sub-provider provider.command)
    :_  state(prov [~ provider.command])
    ?~  prov  ~[sub-card]
    :~  :*  %pass  /set-provider/[(scot %p u.prov)]
            %agent  [u.prov %volt-provider]  %leave  ~
        ==
        sub-card
    ==
  ::
      %open-channel
    =/  =peer    (~(gut by peers) to.command *peer)
    =/  chid=id  (make-temporary-channel-id)
    =^  basepoints      keyr  (generate-basepoints keys.state)
    =^  funding-pubkey  keyr  (~(next-pubkey keyring:bolt keyr) %multisig)
    =.  keyr            keyr
    |^
    =|  lar=larva-chan
    =.  oc.lar            (some oc)
    =.  initiator.lar     %.y
    =.  pending.peer      (~(put by pending.peer) chid lar)
    =.  num-pending.peer  +(num-pending.peer)
    =.  peers             (~(put by peers) to.command peer)
    :_  state
    ~[(send-message to.command chid [%funding %open-channel oc])]
    ::
    ++  oc
      =,  secp256k1:secp:crypto
      =|  oc=open-channel:msg
      %_  oc
        temporary-channel-id  chid
        basepoints            basepoints
        funding-sats          local-amt.command
        push-msats            push-amt.command
        funding-pubkey        [33 (compress-point key.funding-pubkey)]
        dust-limit                ~  :: TODO
        max-htlc-value-in-flight  ~
      ==
    --
  ::
      %close-channel
    `state
  ==
::
++  handle-message
  |=  =message
  ^-  (quip card _state)
  ?-    -.message
      %funding
    (handle-funding-message +.message)
  ::
      %closing
    (handle-closing-message +.message)
  ::
      %htlc
    (handle-htlc-message +.message)
  ::
      %update-fee
    =/  =peer  (~(got by peers) src.bowl)
    =/  =chan  (~(got by chans.peer) channel-id.message)
    ::  check new fee is ok
    =.  chans.peer
      %+  ~(put by chans.peer)
        channel-id.message
      chan(feerate-per-kw feerate-per-kw.message)
    =.  peers
      (~(put by peers) src.bowl peer)
    `state
  ==
::  +handle-funding-message: channel establishment flow
::
::  +-------+                              +-------+
::  |       |--(1)---  open_channel  ----->|       |
::  |       |<-(2)--  accept_channel  -----|       |
::  |       |                              |       |
::  |   A   |--(3)--  funding_created  --->|   B   |
::  |       |<-(4)--  funding_signed  -----|       |
::  |       |                              |       |
::  |       |--(5)--- funding_locked  ---->|       |
::  |       |<-(6)--- funding_locked  -----|       |
::  +-------+                              +-------+
::
++  handle-funding-message
  |=  msg=funding-message
  ^-  (quip card _state)
  ?-    -.msg
      %open-channel
    (handle-open-channel +.msg)
  ::
      %accept-channel
    (handle-accept-channel +.msg)
  ::
      %funding-created
    (handle-funding-created +.msg)
  ::
      %funding-signed
    (handle-funding-signed +.msg)
  ::
      %funding-locked
    (handle-funding-locked +.msg)
  ==
::
++  handle-open-channel
  |=  oc=open-channel:msg
  |^  ^-  (quip card _state)
  =/  chid=id                   temporary-channel-id.oc
  =/  =peer                     (~(gut by peers) src.bowl *peer)
  =/  err=(unit reject-reason)  (check-open-channel oc)
  ?:  ?=(^ err)
    :_  state
    ~[(send-error src.bowl chid u.err)]
  ::
  =^  basepoints      keyr  (generate-basepoints keys.state)
  =^  funding-pubkey  keyr  (~(next-pubkey keyring:bolt keyr) %multisig)
  =/  ac=accept-channel:msg
    %^    make-accept-channel
        oc
      basepoints
    :*  wid=33
        dat=(compress-point:secp256k1:secp:crypto key.funding-pubkey)
    ==
  ::
  =|  lar=larva-chan
  =.  oc.lar  (some oc)
  =.  ac.lar  (some ac)
  ::
  =.  pending.peer      (~(put by pending.peer) temporary-channel-id.oc lar)
  =.  num-pending.peer  +(num-pending.peer)
  :_  state(peers (~(put by peers) src.bowl peer), keyr keyr)
  ~[(send-message src.bowl chid [%funding %accept-channel ac])]
  ::
  ++  make-accept-channel
    |=  [oc=open-channel:msg =basepoints =funding=pubkey]
    |^  ^-  accept-channel:msg
    =|  ac=accept-channel:msg
    %_  ac
      temporary-channel-id        temporary-channel-id.oc
      funding-pubkey              funding-pubkey
      dust-limit                  dust-limit.oc
      basepoints                  basepoints
      first-per-commitment-point  first-commitment-point
      shutdown-script-pubkey      shutdown-script-pubkey
    ::
      max-htlc-value-in-flight
    (~(required-remote-max-value config:bolt conf.state) funding-sats.oc)
      channel-reserve
    (~(required-remote-chan-reserve config:bolt conf.state))
      htlc-minimum
    ~(min-htlc-value config:bolt conf.state)
      minimum-depth
    (~(num-required-confs config:bolt conf.state))
      to-self-delay
    (~(required-remote-delay config:bolt conf.state) funding-sats.oc)
      max-accepted-htlcs
    (~(required-remote-max-htlcs config:bolt conf.state))
    ==
    ::
    ++  first-commitment-point
      ^-  point
      *point
    ::
    ++  shutdown-script-pubkey
      ^-  hexb:bc
      0^0x0
    --
  ::
  ++  check-open-channel
    |=  oc=open-channel:msg
    ^-  (unit reject-reason)
    =/  c=config  conf.state
    ?:  (gth funding-sats.oc ~(max-chan-size config:bolt c))
      (some %chan-too-large)
    ?:  (lth funding-sats.oc ~(min-chan-size config:bolt c))
      (some %chan-too-small)
    ?:  ?&  ~(reject-push config:bolt conf.state)
            (gth push-msats.oc 0)
        ==
      (some %push-rejected)
    ?:  (gth push-msats.oc (sats-to-msats:bolt-tx:bolt funding-sats.oc))
      (some %push-too-large)
    ?:  (gth to-self-delay.oc max-remote-delay:const:bolt)
      (some %delay-too-large)
    ?:  %+  gth  max-accepted-htlcs.oc
        %+  div  max-htlc-number:const:bolt  2
      (some %max-htlc-too-large)
    ?:  (lth feerate-per-kw.oc 1.000)
      (some %fee-too-small)
    ~
  --
::
++  handle-accept-channel
  |=  ac=accept-channel:msg
  |^  ^-  (quip card _state)
  =/  =peer
    (~(got by peers.state) src.bowl)
  =/  lar=larva-chan
    (~(got by pending.peer) temporary-channel-id.ac)
  ?>  ?&  ?=(^ oc.lar)
          initiator.lar
      ==
  `state
  ::
  ++  make-funding-created
    ^-  funding-created:msg
    *funding-created:msg
  --
::
++  handle-funding-created
  |=  fc=funding-created:msg
  ^-  (quip card _state)
  `state
::
++  handle-funding-signed
  |=  fs=funding-signed:msg
  ^-  (quip card _state)
  `state
::
++  handle-funding-locked
  |=  fs=funding-locked:msg
  ^-  (quip card _state)
  `state
::  +handle-htlc-message: perform HTLC behavior
::
::  +-------+                               +-------+
::  |       |--(1)---- update_add_htlc ---->|       |
::  |       |--(2)---- update_add_htlc ---->|       |
::  |       |<-(3)---- update_add_htlc -----|       |
::  |       |                               |       |
::  |       |--(4)--- commitment_signed --->|       |
::  |   A   |<-(5)---- revoke_and_ack ------|   B   |
::  |       |                               |       |
::  |       |<-(6)--- commitment_signed ----|       |
::  |       |--(7)---- revoke_and_ack ----->|       |
::  |       |                               |       |
::  |       |--(8)--- commitment_signed --->|       |
::  |       |<-(9)---- revoke_and_ack ------|       |
::  +-------+                               +-------+
::
++  handle-htlc-message
  |=  msg=htlc-message
  ^-  (quip card _state)
  ?-    -.msg
      %update-add-htlc
    `state
  ::
      %commitment-signed
    `state
  ::
      %revoke-and-ack
    `state
  ::
      %update-fulfill-htlc
    `state
  ::
      %update-fail-htlc
    `state
  ::
      %update-fail-malformed-htlc
    `state
  ==
::  +handle-closing-message: run channel closing flow
::
::  +-------+                              +-------+
::  |       |--(1)-----  shutdown  ------->|       |
::  |       |<-(2)-----  shutdown  --------|       |
::  |       |                              |       |
::  |       | <complete all pending HTLCs> |       |
::  |   A   |                 ...          |   B   |
::  |       |                              |       |
::  |       |--(3)-- closing_signed  F1--->|       |
::  |       |<-(4)-- closing_signed  F2----|       |
::  |       |              ...             |       |
::  |       |--(?)-- closing_signed  Fn--->|       |
::  |       |<-(?)-- closing_signed  Fn----|       |
::  +-------+                              +-------+
::
++  handle-closing-message
  |=  msg=closing-message
  ^-  (quip card _state)
  ?-    -.msg
      %shutdown
    `state
  ::
      %closing-signed
    `state
  ==
::
++  make-temporary-channel-id
  |.
  ^-  id
  (~(rad og eny.bowl) 0x1.0000.0000)
::
++  generate-basepoints
  |=  k=^keyr
  =^  revo  k  (~(next-pubkey keyring:bolt k) %revocation-base)
  =^  paym  k  (~(next-pubkey keyring:bolt k) %payment-base)
  =^  dely  k  (~(next-pubkey keyring:bolt k) %delay-base)
  =^  htlc  k  (~(next-pubkey keyring:bolt k) %htlc-base)
  :_  k
  ::  throwing away idx and fam,
  ::  do we need to track these?
  :*  revocation=key.revo
      payment=key.paym
      delayed-payment=key.dely
      htlc=key.htlc
  ==
::  +metamorphose-channel: make an adult chan from larva
::
++  metamorphose-channel
  |=  lar=larva-chan
  |^  ^-  chan
  ~|  %incomplete-larva-chan
  ?>  ?&  ?=(^ oc.lar)
          ?=(^ ac.lar)
          ?=(^ fc.lar)
          ?=(^ fs.lar)
          ?=(^ fl-funder.lar)
          ?=(^ fl-fundee.lar)
      ==
  =|  chan=chan
  %_  chan
    id                        channel-id.u.fl-fundee.lar
    initiator                 initiator.lar
    our                       our-state
    her                       her-state
    funding-outpoint          funding-outpoint.u.fc.lar
    funding-sats              funding-sats.u.oc.lar
    dust-limit                dust-limit.u.ac.lar
    max-htlc-value-in-flight  max-htlc-value-in-flight.u.ac.lar
    channel-reserve           channel-reserve.u.ac.lar
    htlc-minimum              htlc-minimum.u.ac.lar
    feerate-per-kw            feerate-per-kw.u.oc.lar
    to-self-delay             to-self-delay.u.ac.lar
    cltv-expiry-delta         cltv-expiry-delta.u.oc.lar
    max-accepted-htlcs        max-accepted-htlcs.u.ac.lar
    anchor-outputs            anchor-outputs.u.oc.lar
  ==
  ::
  ++  our-state
    ?:  initiator.lar
      *chlen
    *chlen
  ::
  ++  her-state
    ?:  initiator.lar
      *chlen
    *chlen
  --
::
++  sub-provider
  |=  provider=ship
  ^-  card
  :*  %pass  /set-provider/[(scot %p provider)]
      %agent  [provider %volt-provider]  %watch  /clients
  ==
::
++  poke-provider
  |=  act=action:provider
  ^-  card
  ?~  prov  ~|("provider not set" !!)
  :*  %pass  /[(scot %da now.bowl)]
      %agent  [our.bowl %volt-provider]
      %poke  %volt-provider-action  !>([action])
  ==
::
++  send-message
  |=  [to=ship chid=id msg=message]
  ^-  card
  :*  %pass   /[-.msg]/[(scot %da chid)]
      %agent  [to %volt]
      %poke   %volt-message  !>([msg])
  ==
::
++  send-error
  |=  [to=ship chid=id err=reject-reason]
  ^-  card
  :*  %pass   /[(scot %da chid)]
      %agent  [to %volt]
      %poke   %volt-error  !>([err])
  ==
--
