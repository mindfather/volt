import { Urbit, AuthenticationInterface } from "@urbit/http-api";
import { Pokes } from "./enums";
import { createContext, createSignal, createResource, batch} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { VoltState } from "../types/state";
import { dummyTransactions } from "../test";

const urbitURL = "localhost:8081";

export const VoltContext = createContext([new VoltState(), {}]);

const fetchRates = async (symbol) => (await fetch(
    `https://api.blockchain.com/v3/exchange/tickers/${symbol}`,
    {headers: new Headers({'accept': 'application/json'})})).json()

export const createUrbit = async (api) => {
    const urbit = await Urbit.authenticate(
        {ship: window.ship || "zod", url: urbitURL, code: "lidlut-tabwed-pillex-ridrup"}
    );
    urbit.onOpen  = () => api.setState("state", "open");
    urbit.onRetry = () => api.setState("state", "retry");
    urbit.onError = () => api.setState("state", "error");
    api.setState("airlock", urbit);
};

export function VoltProvider(props) {
  const [state, setState] = createStore(VoltState.From(props));

  const poke = async (mark: Pokes, json) => {
    const p = await state.airlock.poke ({
      app: 'volt',
      mark,
      json,
    });

    return p;
  }

  const scry = async (app, path) => {
      const s = await state.airlock.scry({app, path});
      return s;
  }

  const api = {
    sendPoke({pokeType, json}, err, callback) {
      poke(pokeType, json).catch(err).then(callback);
    },
    setState(...args: any[]) {
        setState(...args);
    },
    fetchRates() {
        fetchRates(`BTC-${state.currency}`).then((rates) => {
          setState("exchangerates", rates);
        });
    }
  };

  createUrbit(api).then(() => subscribeToFeed(state, api));
  const voltState = [state,api];

  return (
    <VoltContext.Provider value={voltState}>
      {props.children}
    </VoltContext.Provider>
  );
}

export async function subscribeToFeed(state, api) {
    const voltSubscriptionHandler = (resp) => {
        switch(true) {
            case resp['initial'] != undefined: {
                let provider = resp['initial'].provider;
                let btcprovider = resp['initial']['btc-provider'];
                let larva: any[] = resp['initial']['larva'];
                let live: any[] = resp['initial']['live'];

                batch(() => {
                  api.setState("provider", {
                      ship: '~' + provider.host,
                      connected: provider.connected
                  });

                  api.setState("btcprovider", {
                      ship: '~' + btcprovider.host,
                      connected: btcprovider.connected
                  });

                  api.setState("channels", "larval", produce((channels) => {
                    larva.forEach((channel) => {
                      channels.push({
                        channelId: channel['temporary-channel-id'],
                        address: channel['data']['funding-address'],
                        capacity: channel['data']['funding-sats'],
                        who: channel['data']['who']
                      });
                    });
                  }));
                  api.setState("channels", "live", produce((channels) => {
                    live.forEach((channel) => {
                      channels.push({
                        channelId: channel['channel-id'],
                        capacity: channel['data']['sats-capacity'],
                        state: channel['data']['state'],
                        who: channel['data']['who'],
                        balance: channel['data']['balance']
                      });
                    });
                  }));
                });

                let map = new Map<string, Transaction[]>();
                dummyTransactions.forEach((transaction) => {
                    let datestring = (new Date(transaction.timestamp)).toDateString();
                    if(!map.has(datestring)) map.set(datestring, [transaction]);
                    else map.set(datestring, map.get(datestring).push(transaction));
                });
                api.setState("transactions", map);

                break;
            }
            case resp['provider-ack'] != undefined: {
                let {host, connected} = resp['provider-ack'];
                api.setState("provider", {
                    ship: '~' + host,
                    connected
                });
                break;
            }
            case resp['btc-provider-ack'] != undefined: {
                let {host, connected} = resp['btc-provider-ack'];
                api.setState("btcprovider", {
                    ship: '~' + host,
                    connected
                });
                break;
            }
            case resp['need-funding-signature'] != undefined: {
                api.setState("channels", "larval", produce((channels) => {
                  channels.push({
                    address: resp['need-funding-signature'].address,
                    channelId: resp['need-funding-signature']['temporary-channel-id'],
                    capacity: 0
                  });
                }));
                break;
            }
            case resp['channel-state'] != undefined: {
                api.setState("channels", "live", produce((channels) => {
                  channels.push({
                    state: resp['channel-state']['chan-state'],
                    channelId: channel['chan-id'],
                    capacity: 0,
                  });
                }));
                break;
            }
            case resp['new-payreq'] != undefined: {
                api.setState("payreq", resp['new-payreq']);
                break;
            }
            default:
                console.log(resp);
                break;
        }
    };

    let id = await state.airlock.subscribe({
        app: 'volt',
        path: '/all',
        err: handleError,
        event: voltSubscriptionHandler,
        quit: handleQuit,
    });
    api.setState("subscriptionId",id);
}

const handleError = (data) => {
  console.log('FROM ERROR');
  console.log(data);
}

const handleQuit = (data) => {
  console.log('FROM QUIT');
  console.log(data);
}
