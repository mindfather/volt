::  BOLT 11: Invoice Protocol for Lightning Payments
::  https://github.com/lightningnetwork/lightning-rfc/blob/master/11-payment-encoding.md
::
/-  btc=bitcoin
/+  bcu=bitcoin-utils
=,  btc
=,  bcu
|%
+$  network     ?(%main %testnet %signet %regtest)
+$  multiplier  ?(%m %u %n %p)
+$  amount      [@ud (unit multiplier)]
::
++  prefixes
  ^-  (map network tape)
  %-  my
  :~  [%main "bc"]
      [%testnet "tb"]
      [%signet "tbs"]
      [%regtest "bcrt"]
  ==
::
++  networks
  ^-  (map @t network)
  %-  my
  :~  ['bc' %main]
      ['tb' %testnet]
      ['tbs' %signet]
      ['bcrt' %regtest]
  ==
::
+$  invoice
  $:  =network
      timestamp=@da
      payment-hash=hexb
      payment-secret=(unit hexb)
      signature=hexb
      pubkey=hexb
      expiry=@dr
      min-final-cltv-expiry=@ud
      amount=(unit amount)
      description=(unit @t)
      unknown-tags=(map @tD hexb)
      fallback-address=(unit hexb)
      route=(list route)
  ==
::
+$  route
  $:  pubkey=hexb
      short-channel-id=@ud
      feebase=@ud
      feerate=@ud
      cltv-expiry-delta=@ud
  ==
::
++  de
  |=  body=cord
  |^  ^-  (unit invoice)
  %+  biff  (decode-raw:bech32 body)
  |=  raw=raw-decoded:bech32
  =/  =bits  (from-atoms:bit 5 data.raw)
  ?:  (lth wid.bits (mul 65 8))
    ~&  >>>  'too short to contain a signature'
    ~
  %+  biff  (rust hrp.raw hum)
  |=  [=network amt=(unit amount)]
  ?.  (valid-amount amt)
    ~&  >>>  'invalid amount'
    ~
  =|  =invoice
  =:  network.invoice    network
      amount.invoice     amt
      signature.invoice  [64 (cut 3 [1 64] dat.bits)]
      expiry.invoice     ~s3600
      min-final-cltv-expiry.invoice  18
  ==
  =^  date  bits  (read-bits 35 bits)
  =.  timestamp.invoice  (from-unix:chrono:userlib dat.date)
  ::
  %-  some
  |-
  =^  datum  bits  (pull-tagged bits)
  =/  [tag=(unit @tD) len=@ud data=hexb]  datum
  ?:  (lth wid.bits (mul 64 8))
    invoice
  =.  invoice
    ?~  tag  invoice
    ?:  =(u.tag 'p')
      ?.  =(len 52)
        =.  unknown-tags.invoice
          (~(put by unknown-tags.invoice) u.tag data)
        invoice
      =.  payment-hash.invoice  data
      invoice
    ::
    ?:  =(u.tag 's')
      ?.  =(len 52)
        =.  unknown-tags.invoice
          (~(put by unknown-tags.invoice) u.tag data)
        invoice
      =.  payment-secret.invoice  (some data)
      invoice
    ::
    ?:  =(u.tag 'd')
      =.  description.invoice
        %-  some
        ^-  @t
        (swp 3 dat.data)
      invoice
    ::
    ?:  =(u.tag 'n')
      ?.  =(len 53)
        =.  unknown-tags.invoice
          (~(put by unknown-tags.invoice) u.tag data)
        invoice
      =.  pubkey.invoice  data
      invoice
    ::
    ?:  =(u.tag 'x')
      =.  expiry.invoice  `@dr`dat.data
      invoice
    ::
    ?:  =(u.tag 'c')
      =.  min-final-cltv-expiry.invoice  `@ud`dat.data
      invoice
    ::
    ?:  =(u.tag 'f')
      =.  fallback-address.invoice  (some data)
      invoice
    ::
    ?:  =(u.tag 'r')
      invoice
    ::
    ?:  =(u.tag '9')
      invoice
    ::
    =.  unknown-tags.invoice
      (~(put by unknown-tags.invoice) u.tag data)
    invoice
  $(bits bits)
  ::
  ++  read-bits
    |=  [n=@ bs=bits]
    [(take:bit n bs) (drop:bit n bs)]
  ::
  ++  pull-tagged
    |=  in=bits
    ^-  [[(unit @tD) @ud hexb] bits]
    =^  typ  in  (read-bits 5 in)
    =^  hig  in  (read-bits 5 in)
    =^  low  in  (read-bits 5 in)
    =/  len      (add (mul dat.hig 32) dat.low)
    =^  dta  in  (read-bits (mul len 5) in)
    =/  tag  (value-to-charset:bech32 dat.typ)
    [[tag len (to-hexb dta)] in]
  ::
  ++  to-hexb
    |=  =bits
    [wid=(div wid.bits 8) dat=`@ux`(rsh [0 (mod wid.bits 8)] dat.bits)]
  ::
  ++  valid-amount
    |=  amt=(unit amount)
    ?|  =(amt ~)
      ?&(=(+.amt %p) =((mod -.amt 10) 0))
      %.y
    ==
  ::
  ++  hum  ;~(pfix pre ;~(plug net ;~(pose ;~((bend) (easy ~) amt) (easy ~))))
  ++  pre  (jest 'ln')
  ++  net
    %+  sear  ~(get by networks)
    ;~  pose
      (jest 'bc')
      (jest 'tb')
      (jest 'tbs')
      (jest 'bcrt')
    ==
  ++  mpy  (cook multiplier (mask "munp"))
  ++  amt
    ;~  plug
      (cook @ud dem)
      (cook (unit multiplier) ;~((bend) (easy ~) mpy))
    ==
  --
::
++  en
  |=  =invoice
  ^-  (unit cord)
  ~
::
::  need modified bech32 decoder because 90 char length restriction is lifted
::
++  bech32
  |%
  ++  charset  "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
  +$  raw-decoded  [hrp=tape data=(list @) checksum=(list @)]
  ::  below is a port of: https://github.com/bitcoinjs/bech32/blob/master/index.js
  ::
  ++  polymod
    |=  values=(list @)
    |^  ^-  @
    =/  gen=(list @ux)
      ~[0x3b6a.57b2 0x2650.8e6d 0x1ea1.19fa 0x3d42.33dd 0x2a14.62b3]
    =/  chk=@  1
    |-  ?~  values  chk
    =/  top  (rsh [0 25] chk)
    =.  chk
      (mix i.values (lsh [0 5] (dis chk 0x1ff.ffff)))
    $(values t.values, chk (update-chk chk top gen))
  ::
    ++  update-chk
      |=  [chk=@ top=@ gen=(list @ux)]
      =/  is  (gulf 0 4)
      |-  ?~  is  chk
      ?:  =(1 (dis 1 (rsh [0 i.is] top)))
        $(is t.is, chk (mix chk (snag i.is gen)))
      $(is t.is)
    --
  ::
  ++  expand-hrp
    |=  hrp=tape
    ^-  (list @)
    =/  front  (turn hrp |=(p=@tD (rsh [0 5] p)))
    =/  back   (turn hrp |=(p=@tD (dis 31 p)))
    (zing ~[front ~[0] back])
  ::
  ++  verify-checksum
    |=  [hrp=tape data-and-checksum=(list @)]
    ^-  ?
    %-  |=(a=@ =(1 a))
    %-  polymod
    (weld (expand-hrp hrp) data-and-checksum)
  ::
  ++  checksum
    |=  [hrp=tape data=(list @)]
    ^-  (list @)
    ::  xor 1 with the polymod
    ::
    =/  pmod=@
      %+  mix  1
      %-  polymod
      (zing ~[(expand-hrp hrp) data (reap 6 0)])
    %+  turn  (gulf 0 5)
    |=(i=@ (dis 31 (rsh [0 (mul 5 (sub 5 i))] pmod)))
  ::
  ++  charset-to-value
    |=  c=@tD
    ^-  (unit @)
    (find ~[c] charset)
  ++  value-to-charset
    |=  value=@
    ^-  (unit @tD)
    ?:  (gth value 31)  ~
    `(snag value charset)
  ::
  ++  is-valid
    |=  [bech=tape last-1-pos=@]  ^-  ?
    ::  to upper or to lower is same as bech
    ?&  ?|(=((cass bech) bech) =((cuss bech) bech))
        (gte last-1-pos 1)
        (lte (add last-1-pos 7) (lent bech))
    ::  (lte (lent bech) 90)
        (levy bech |=(c=@tD (gte c 33)))
        (levy bech |=(c=@tD (lte c 126)))
    ==
  ::  data should be 5bit words
  ::
  ++  encode-raw
    |=  [hrp=tape data=(list @)]
    ^-  cord
    =/  combined=(list @)
      (weld data (checksum hrp data))
    %-  crip
    (zing ~[hrp "1" (tape (murn combined value-to-charset))])
  ::
  ++  decode-raw
    |=  body=cord
    ^-  (unit raw-decoded)
    =/  bech  (cass (trip body))              ::  to lowercase
    =/  pos  (flop (fand "1" bech))
    ?~  pos  ~
    =/  last-1=@  i.pos
    ::  check bech32 validity (not segwit validity or checksum)
    ?.  (is-valid bech last-1)
      ~
    =/  hrp  (scag last-1 bech)
    =/  encoded-data-and-checksum=(list @)
      (slag +(last-1) bech)
    =/  data-and-checksum=(list @)
      %+  murn  encoded-data-and-checksum
      charset-to-value
    ::  ensure all were in CHARSET
    ?.  =((lent encoded-data-and-checksum) (lent data-and-checksum))
      ~
    ?.  (verify-checksum hrp data-and-checksum)
      ~
    =/  checksum-pos  (sub (lent data-and-checksum) 6)
    `[hrp (scag checksum-pos data-and-checksum) (slag checksum-pos data-and-checksum)]
    --
--
