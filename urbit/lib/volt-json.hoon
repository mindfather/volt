/-  volt, bc=bitcoin
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
  ::
  ++  ship  (su ;~(pfix sig fed:ag))
  ::
  ++  network  (su (perk %main %testnet %regtest ~))
  ::
  ++  open-channel
    %-  ot
    :~
      [%who ship]
      [%funding ni]
      [%push ni]
      [%network network]
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
      [%temporary-channel-id ni]
      [%pbst so]
    ==
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
::
--
