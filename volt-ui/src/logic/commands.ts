import { Pokes } from "./enums";

const createPoke = (json) => { return {
  pokeType : Pokes.Command,
  json
}};

export const setProvider    = (provider: string) => createPoke({ "set-provider": provider });

export const setBTCProvider = (provider: string) => createPoke({ "set-btc-provider": provider });

export const closeChannel   = (chanId: string)   => createPoke({ "close-channel": chanId });

export const sendPayment    = (payreq)   => createPoke({ "send-payment": payreq });

export const openChannel    = (who, funding, push, network) => createPoke({
  "open-channel": {
    "who": who,
    "funding-sats": funding,
    "push-msats": push,
    "network": network
  }
});

export const createFunding  = (temporaryChannelId: number, psbt) => createPoke({
  "create-funding": {
    "temporary-channel-id": temporaryChannelId,
    "psbt": psbt
  }
});

export const addInvoice     = (amount: number, memo: string, network: string) => createPoke({
  "add-invoice": {
    "amount-msats": amount,
    "memo": memo,
    "network": network
  }
});
