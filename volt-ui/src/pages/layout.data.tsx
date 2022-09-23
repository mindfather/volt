import { useContext } from "solid-js";
import { UrbitContext } from "../logic/api";

export default function LayoutData() {
    const [data, api] = useContext(UrbitContext);

    subscribeToFeed(data, api);

    return {data, api};
}

async function subscribeToFeed(data, api) {
    const voltSubscriptionHandler = (resp) => {
        switch(true) {
            case resp['initial'] != undefined: {
                let provider = resp['initial'].provider;
                let btcprovider = resp['initial']['btc-provider'];
                let larva: any[] = resp['initial']['larva'];
                api.setState(["provider"], {
                    ship: '~' + provider.host,
                    connected: provider.connected
                });
                api.setState(["btcprovider"], {
                    ship: '~' + btcprovider.host,
                    connected: btcprovider.connected
                });
                larva.forEach((channel) => {
                    api.addChannel("larval", {
                        temporaryChannelId: channel['temporary-channel-id'],
                        address: channel['data']['funding-address'],
                    });
                });
                break;
            }
            case resp['provider-ack'] != undefined: {
                let {host, connected} = resp['provider-ack'];
                api.setState(["provider"], {
                    ship: '~' + host,
                    connected
                });
                break;
            }
            case resp['btc-provider-ack'] != undefined: {
                let {host, connected} = resp['btc-provider-ack'];
                api.setState(["btcprovider"], {
                    ship: '~' + host,
                    connected
                });
                break;
            }
            case resp['need-funding-signature'] != undefined: {
                let address = resp['need-funding-signature'].address;
                let temporaryChannelId = resp['need-funding-signature']['temporary-channel-id'];
                api.addChannel("larval", {temporaryChannelId, address});
                break;
            }
            default:
                console.log(resp);
                break;
        }
    };

    let voltSubscriptionId = await data.airlock.subscribe({
        app: 'volt',
        path: '/all',
        err: handleError,
        event: voltSubscriptionHandler,
        quit: handleQuit,
    });

    api.setState(["subscriptionId"], voltSubscriptionId);
}

const handleError = (data) => {
  console.log('FROM ERROR');
  console.log(data);
}
const handleQuit= (data) => {
  console.log('FROM QUIT');
  console.log(data);
}
