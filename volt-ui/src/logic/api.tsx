import { Urbit } from "@urbit/http-api";
import { Pokes } from "./enums";
import { createContext } from "solid-js";
import { createStore } from "solid-js/store";

const APP = "volt";

export async function createUrbit() {
  const urbit     = new Urbit("", "", "volt");
  urbit.ship    = window.ship;
  urbit.onOpen  = () => this.setState({conn: "ok"});
  urbit.onRetry = () => this.setState({conn: "try"});
  urbit.onError = () => this.setState({conn: "err"});

  const airlock = await Urbit.authenticate({
    ship: "zod",
    url: "localhost:8081",
    code: "lidlut-tabwed-pillex-ridrup",
  });

  const subscriptionId = await airlock.subscribe({
    app: APP,
    path: '/all',
    err: handleError,
    event: handleSubscription,
    quit: handleQuit,
  });

  return {urbit, airlock, subscriptionId};
}

export const UrbitContext = createContext([{ urbit: null, airlock : null, subscriptionId: null }, {}]);

export function UrbitProvider(props) {
  const [data, api] = createStore({
      urbit: props.urbit || null,
      airlock: props.airlock || null,
      subscriptionId: props.subscriptionId || null,
  });

  const poke = async (mark: Pokes, json) => {
    const p = await data.airlock.poke ({
      app: APP,
      mark,
      json,
    });

    return p;
  }

  const scry = async (app, path) => {
      const s = await data.airlock.scry({app, path});
      console.log(s);
      return s;
  }

  const urbit = [
    data,
    {
      setProvider(provider: string, err, callback) {
        poke(Pokes.Command, {"set-provider": provider}).catch(err).then(callback);
      },
      setBTCProvider(provider: string, err, callback) {
        poke(Pokes.Command, {"set-btc-provider": provider}).catch(err).then(callback);
      },
      closeChannel(chanId, err, callback) {
        poke(Pokes.Command, {"close-channel": chanId}).catch(err).then(callback);
      },
      sendPayment(payreq, err, callback) {
        poke(Pokes.Command, {"send-payment": payreq}).catch(err).then(callback);
      },
      openChannel(json: {who, funding, push, network}, err, callback) {
        poke(Pokes.Command, {"open-channel": json}).catch(err).then(callback);
      },
      createFunding({temporaryChannelId, psbt}, err, callback) {
        poke(Pokes.Command, {
            "create-funding": {
                "temporary-channel-id": temporaryChannelId,
                "psbt": psbt
            }
        }).catch(err).then(callback);
      },
      addInvoice(json: {amount, memo, network}, err, callback) {
          poke(Pokes.Command, {"add-invoice": json}).catch(err).then(callback);
      },
      s() {
        scry("volt", "/provider");
      }
    }
  ];

  return (
    <UrbitContext.Provider value={urbit}>
      {props.children}
    </UrbitContext.Provider>
  );
}


const handleSubscription = (data) => {
  debugger;
  console.log('FROM SUBSCRIPTION');
  console.log(data);
}
const handleError = (data) => {
  debugger;
  console.log('FROM ERROR');
  console.log(data);
}
const handleQuit= (data) => {
  console.log('FROM QUIT');
  console.log(data);
}
