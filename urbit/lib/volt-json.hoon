/-  volt, bolt, bc=bitcoin
/+  bcj=bitcoin-json
!:
|%
++  dejs
  =,  dejs:format
  |%
  ++  command
    |=  jon=json
    ^-  command:volt
    %.  jon
    %-  of
    :~
      [%set-provider (mu ship)]
      [%set-btc-provider (mu ship)]
      [%open-channel open-channel]
      [%create-funding create-funding]
      [%close-channel ni]
      [%send-payment send-payment]
      [%add-invoice add-invoice]
    ==
  ++  ship  (su ;~(pfix sig fed:ag))
  ::
  ++  network  (su (perk %main %testnet %regtest ~))
  ::
  ++  open-channel
    %-  ot
    :~  who+ship
        funding-sats+ni
        push-msats+ni
        network+network
    ==
  ::
  ++  send-payment
    %-  ot
    :~  payreq+so
    ==
  ::
  ++  create-funding
    %-  ot
    :~
      [%temporary-channel-id temporary-channel-id]
      [%psbt so]
    ==
  ::
  ++  temporary-channel-id
    %+  cu
      ;:  corl
        tail
        need
        de:base64:mimes:html
      ==
    so
  ::
  ++  add-invoice
    %-  ot
    :~
      [%amount ni]
      [%memo (mu so)]
      [%network (mu network)]
    ==
  ::
  --
++  enjs
  =,  enjs:format
  |%
  ++  update
    |=  upd=update:volt
    ^-  json
    %+  frond  -.upd
    ?-  -.upd
      %initial                 (initial upd)
      %need-funding-signature  (need-funding-signature upd)
      %channel-state           (channel-state upd)
      %provider-ack            (provider-ack upd)
      %btc-provider-ack        (btc-provider-ack upd)
      %received-payment        (received-payment upd)
    ==
  ::
  ++  need-funding-signature
    |=  upd=update:volt
    ?>  ?=(%need-funding-signature -.upd)
    ^-  json
    %-  pairs
    :~  temporary-channel-id+s+(en:base64:mimes:html [(met 3 temporary-channel-id.upd) temporary-channel-id.upd])
        address+(address:enjs:bcj address.upd)
    ==
  ::
  ++  channel-state
    |=  upd=update:volt
    ?>  ?=(%channel-state -.upd)
    ^-  json
    %-  pairs
    :~  chan-id+(numb chan-id.upd)
        chan-state+s+chan-state.upd
    ==
  ::
  ++  provider-ack
    |=  upd=update:volt
    ?>  ?=(%provider-ack -.upd)
    ^-  json
    (provider-state `provider-state.upd)
  ::
  ++  btc-provider-ack
    |=  upd=update:volt
    ?>  ?=(%btc-provider-ack -.upd)
    ^-  json
    (provider-state `provider-state.upd)
  ::
  ++  received-payment
    |=  upd=update:volt
    ?>  ?=(%received-payment -.upd)
    ^-  json
    %-  pairs
    :~  from+(ship from.upd)
    ==
  ::
  ++  provider-state
    |=  p=(unit provider-state:volt)
    ^-  json
    %-  pairs
    ?~  p
      :~  host+s+''
          connected+b+%.n
      ==
    :~  host+(ship -.u.p)
        connected+b+connected.u.p
    ==
  ::
  ++  larv
    |=  l=(map id:bolt larv-chan:volt)
    ^-  json
    :-  %a
    %+  turn  ~(tap by l)
    |=  [k=@ v=larv-chan:volt]
    %-  pairs
    :~  temporary-channel-id+s+(en:base64:mimes:html [(met 3 k) k])
        data+(larva-content v)
    ==
  ::
  ++  larva-content
    |=  [l=larv-chan:volt]
    ^-  json
    %-  pairs
    :~  dust-limit-sats+(numb dust-limit-sats.l)
        funding-address+(address:enjs:bcj funding-address.l)
        funding-sats+(numb funding-sats.l)
    ==
  ::
  ++  initial
    |=  upd=update:volt
    ?>  ?=(%initial -.upd)
    ^-  json
    %-  pairs
    :~  provider+(provider-state provider.upd)
        btc-provider+(provider-state btc-provider.upd)
        larva+(larv larva.upd)
    ==
  ::
  --
::
--
