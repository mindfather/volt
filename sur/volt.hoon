::
:: sur/volt.hoon
::
/-  bc=bitcoin
|%
::
+$  pubkey    hexb:bc
+$  txid      hexb:bc
+$  hash      hexb:bc
+$  preimage  hexb:bc
::
+$  msats    @ud
+$  chan-id  @ud
+$  htlc-id  @ud
::
+$  circuit-key
  $:  =chan-id
      =htlc-id
  ==
::
+$  htlc-info
  $:  =circuit-key  :: incoming circuit
      =hash         :: payment hash
      =chan-id      :: outgoing channel
  ==
::
++  rpc
  |%
  +$  action
    $%  [%get-info ~]
        [%open-channel node=pubkey local-amount=sats:bc push-amount=sats:bc]
        [%close-channel funding-txid=txid output-index=@ud]
        [%settle-htlc =circuit-key =preimage]
        [%fail-htlc =circuit-key]
    ==
  ::
  +$  result
    $%  [%get-info version=@t commit-hash=@t identity-pubkey=pubkey]
        [%open-channel channel-point]
        [%close-channel ~]
        [%settle-htlc =circuit-key]
        [%fail-htlc =circuit-key]
    ==
  ::
  +$  error
    $:  code=@ud
        message=@t
    ==
  ::
  +$  response  (each result error)
  ::
  +$  route-hint
    $:  node-id=pubkey
        =chan-id
        fee-base-msat=@ud
        fee-proportional-usat=@ud
        cltv-expiry-delta=@ud
    ==
  ::
  +$  channel-update
    $%  [%open-channel channel]
        [%closed-channel channel-close-summary]
        [%active-channel channel-point]
        [%inactive-channel channel-point]
        [%pending-channel pending-channel]
    ==
  ::
  +$  channel
    $:  active=?
        remote-pubkey=pubkey
        channel-point=@t
        =chan-id
        capacity=sats:bc
        local-balance=sats:bc
        remote-balance=sats:bc
        commit-fee=sats:bc
        total-sent=sats:bc
    ==
  ::
  +$  channel-close-summary
    $:  channel-point=@t
        =chan-id
        chain-hash=@t
        closing-tx-hash=@t
        remote-pubkey=pubkey
        channel-closure-type=@tas
    ==
  ::
  +$  channel-point
    $:  =funding=txid
        output-index=@ud
    ==
  ::
  +$  pending-channel
    $:  =txid
        output-index=@ud
    ==
  ::
  +$  htlc-intercept-request
    $:  incoming-circuit-key=circuit-key
        incoming-amount-msat=sats:bc
        incoming-expiry=@ud
        payment-hash=hexb:bc
        outgoing-requested-chan-id=chan-id
        outgoing-amount-msat=sats:bc
        outgoing-expiry=@ud
        onion-blob=hexb:bc
    ==
  ::
  +$  htlc-intercept-response
    $:  incoming-circuit-key=circuit-key
        action=htlc-action
        preimage=(unit hexb:bc)
    ==
  ::
  +$  htlc-action  ?(%'SETTLE' %'FAIL' %'RESUME')
  --
::
::  provider types
::
++  provider
  |%
  ::
  +$  host-info
    $:  api-url=@t
        connected=?
        clients=(set ship)
    ==
  ::
  +$  channel-info
    $:  =chan-id
        active=?
        local-balance=sats:bc
        remote-balance=sats:bc
        remote-pubkey=pubkey
        client=(unit ship)
    ==
  ::
  +$  command
    $%  [%set-url api-url=@t]
        [%open-channel to=pubkey local-amt=sats:bc push-amt=sats:bc]
        [%close-channel funding-txid=txid output-index=@ud]
    ==
  ::
  +$  action
    $%  [%ping ~]
        [%settle-htlc =htlc-info =preimage]
        [%fail-htlc =htlc-info]
    ==
  ::
  +$  error
    $%  [%rpc-error error:rpc]
        [%not-connected ~]
        [%bad-request ~]
    ==
  ::
  +$  update  (each result error)
  ::
  +$  status
    $%  [%connected ~]
        [%disconnected ~]
    ==
  --
::
::  client types
::
+$  command
  $%  [%set-provider provider=ship]
      [%open-channel to=ship local-amt=sats:bc push-amt=msats]
      [%close-channel chan=chan-id]
  ==
::
+$  action
  $%  [%settle-htlc =htlc-info:provider]
      [%fail-htlc =htlc-info:provider]
  ==
--
