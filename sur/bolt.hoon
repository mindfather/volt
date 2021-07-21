::  bolt.hoon
::  Datatypes to implement Lightning BOLT RFCs.
::
/-  bc=bitcoin, bw=btc-wallet, bp=btc-provider
|%
+$  id  @ud
+$  pubkey  hexb:bc
+$  privkey  hexb:bc
+$  witness  (list hexb:bc)
+$  signature  hexb:bc
+$  outpoint  [=txid:bc pos=@ud =sats:bc]
+$  commitment-number  @ud
+$  point  point:secp:crypto
+$  blocks  @ud                               ::  number of blocks
+$  msats  @ud                                ::  millisats
+$  network  ?(%main %testnet %regtest)
::  +tx
::   modifications to bitcoin tx types, to be merged back later
::
++  tx
  |%
  +$  data
    $:  data:tx:bc
        ws=(list witness)
    ==
  --
::
+$  basepoints
  $:  revocation=point
      payment=point
      delayed-payment=point
      htlc=point
  ==
::
+$  htlc
  $:  from=ship
      =channel=id
      =id
      amount-msat=msats
      payment-hash=hexb:bc
      cltv-expiry=blocks
      payment-preimage=(unit hexb:bc)
      local-sig=(unit hexb:bc)
      remote-sig=(unit hexb:bc)
  ==
::
++  commitment-keyring
  $:  local-htlc-key=pubkey
      remote-htlc-key=pubkey
      to-local-key=pubkey
      to-remote-key=pubkey
      revocation-key=pubkey
  ==
::
+$  commit-state
  $:
      =commitment-number
      ::  lexicographically ordered
      ::  increasing CLTV order tiebreaker for identical HTLCs
      ::
      offered=(list htlc)
      received=(list htlc)
  ==
::  pending offered HTLC that we're waiting for revoke_and_ack on
::
+$  htlc-pend
  $:  =htlc
      prior-txid=txid:bc
      revocation-pubkey=pubkey
  ==
::
+$  htlc-state
  $:  next-offer=id
      next-receive=id
      offer=(unit htlc-pend)
      receive=(unit htlc-pend)
  ==
::  chlen: 1 of the 2 members of a channel
::
+$  chlen
  $:  =ship
      =funding=pubkey
      =funding=signature
      =shutdown-script=pubkey
      =basepoints
      per-commitment-point=point
      next-per-commitment-point=point
      =commit-state
  ==
::
::  larva-chan: a channel in the larval state
::   - holds all the messages back and forth until finalized
::   - used to build chan
+$  larva-chan
  $:  oc=(unit open-channel:msg)
      ac=(unit accept-channel:msg)
      fc=(unit funding-created:msg)
      fs=(unit funding-signed:msg)
      fl-funder=(unit funding-locked:msg)
      fl-fundee=(unit funding-locked:msg)
      initiator=?
  ==
::  chan: channel state
::
+$  chan
  $:  =id
      initiator=?
      our=chlen
      her=chlen
      =funding=outpoint
      =funding=sats:bc
      dust-limit=sats:bc
      max-htlc-value-in-flight=msats
      channel-reserve=sats:bc
      htlc-minimum=msats
      feerate-per-kw=sats:bc
      to-self-delay=blocks
      cltv-expiry-delta=blocks
      max-accepted-htlcs=@ud
      anchor-outputs=?
      revocations=(map txid:bc per-commitment-secret=privkey)
      =htlc-state
  ==
::  msg: BOLT spec messages between peers
::    defined in RFC02
::
++  msg
  |%
  ::  channel messages
  ::
  +$  open-channel
    $:  chain-hash=hexb:bc
        =temporary-channel=id
        =funding=sats:bc
        =push=msats
        =funding=pubkey
        dust-limit=sats:bc
        max-htlc-value-in-flight=msats
        channel-reserve=sats:bc
        htlc-minimum=msats
        feerate-per-kw=sats:bc
        to-self-delay=blocks
        cltv-expiry-delta=blocks
        max-accepted-htlcs=@ud
        =basepoints
        =first-per-commitment=point
        =shutdown-script=pubkey
        anchor-outputs=?
    ==
  +$  accept-channel
    $:  =temporary-channel=id
        =funding=pubkey
        dust-limit=sats:bc
        max-htlc-value-in-flight=msats
        channel-reserve=sats:bc
        htlc-minimum=msats
        minimum-depth=blocks
        to-self-delay=blocks
        max-accepted-htlcs=@ud
        =basepoints
        =first-per-commitment=point
        =shutdown-script=pubkey
    ==
  +$  funding-created
    $:  =temporary-channel=id
        =funding=outpoint
        =signature
    ==
  +$  funding-signed
    $:  =channel=id
        =signature
    ==
  +$  funding-locked
    $:  =channel=id
        =next-per-commitment=point
    ==
  ::
  ::  HTLC messages
  ::
  +$  add-signed-htlc
    $:  add=update-add-htlc
        sign=commitment-signed
    ==
  +$  update-add-htlc
    $:  =channel=id
        =htlc=id
    ==
  +$  update-fail-htlc
    $:  =channel=id
        id=@ud
        reason=tape
    ==
  +$  update-fulfill-htlc
    $:  =channel=id
        id=@ud
        payment-preimage=hexb:bc
    ==
  +$  update-fail-malformed-htlc
    $:  =channel=id
        id=@ud
        cod=@ud
    ==
  +$  commitment-signed
    $:  =channel=id
        sig=signature
        num-htlcs=@ud
        htlc-sigs=(list signature)
    ==
  +$  revoke-and-ack
    $:  =channel=id
        =id
        per-commitment-secret=hexb:bc
        next-per-commitment-point=point
    ==
  ::
  ::  channel close messages
  ::
  +$  shutdown
    $:  =channel=id
        len=@ud
        =script=pubkey
    ==
  +$  closing-signed
    $:  =channel=id
        fee=sats:bc
        sig=signature
    ==
  ::
  +$  update-fee
    $:  =channel=id
        feerate-per-kw=sats:bc
    ==
  --
::
+$  funding-message
  $%  [%open-channel open-channel:msg]
      [%accept-channel accept-channel:msg]
      [%funding-created funding-created:msg]
      [%funding-signed funding-signed:msg]
      [%funding-locked funding-locked:msg]
  ==
::
+$  closing-message
  $%  [%shutdown shutdown:msg]
      [%closing-signed closing-signed:msg]
  ==
::
+$  htlc-message
  $%  [%update-add-htlc update-add-htlc:msg]
      [%update-fail-htlc update-fail-htlc:msg]
      [%update-fulfill-htlc update-fulfill-htlc:msg]
      [%update-fail-malformed-htlc update-fail-malformed-htlc:msg]
      [%commitment-signed commitment-signed:msg]
      [%revoke-and-ack revoke-and-ack:msg]
  ==
::
+$  message
  $%  [%funding funding-message]
      [%closing closing-message]
      [%htlc htlc-message]
      [%update-fee update-fee:msg]
  ==
::
+$  reject-reason
  $?  %chan-too-large
      %chan-too-small
      %push-rejected
      %push-too-large
      %delay-too-large
      %max-htlc-too-large
      %fee-too-small
  ==
::
+$  peer
  $:  chans=(map id chan)
      num-chans=@ud
      pending=(map id larva-chan)
      num-pending=@ud
  ==
::
+$  config
  $:  min-chan-size=sats:bc
      max-chan-size=sats:bc
      max-pending=@ud
      reject-push=?
      max-local-csv-delay=@ud
      min-htlc-value=msats
  ==
::
::  wallet types
::
+$  fam
  $?  %multisig
      %revocation-base
      %htlc-base
      %payment-base
      %delay-base
      %revocation-root
  ==
::
+$  keyr
  $:  =wamp:bw
      =network:bc
      idxs=(map fam idx:bc)
  ==
::
+$  keyd  [=fam ind=@ud key=point]
::
--
