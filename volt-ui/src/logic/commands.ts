export const Commands = {
  setProvider     : (provider: string) => ({"set-provider": provider}),
  setBTCProvider  : (provider: string) => ({"set-btc-provider": provider}),
  closeChannel    : (chanId: number)   => ({"chan-id": chanId}),
  sendPayment     : (payreq)   => ({"payreq": payreq}),
  openChannel     : (who: string, funding, push, network: string) => (
                      {
                        "open-channel": {
                          "who": who,
                          "funding": funding,
                          "push": push,
                          "network": network
                        }
                      }
                    ),
  createFunding   : (temporaryChannelId: number, psbt) => (
                      {
                        "create-funding": {
                          "temporary-channel-id": temporaryChannelId,
                          "psbt": psbt
                        }
                      }
                    ),
  addInvoice      : (amount: number, memo: string, network: string) => (
                      {
                        "add-invoice": {
                          "amount": amount,
                          "memo": memo,
                          "network": network
                        }
                      }
                    )
}
