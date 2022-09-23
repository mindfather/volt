import { Urbit, AuthenticationInterface } from "@urbit/http-api";
import { Pokes } from "./enums";
import { createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";

const UrbitState =  {
  urbit: null,
  airlock : null,
  state: {
    subscriptionId: 0,
    provider: {
      ship: "",
      connected: false
    },
    btcprovider: {
      ship: "",
      connected: false
    },
    channels: {
      live: [],
      larval: []
    }
  }
};

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


    return {urbit, airlock, state:UrbitState.state};
}

export const UrbitContext = createContext([UrbitState, {}]);

export function UrbitProvider(props) {
  const [data, setData] = createStore({
      urbit: props.urbit || null,
      airlock: props.airlock || null,
      state: props.state || null,
  });

  const poke = async (mark: Pokes, json) => {
    const p = await data.airlock.poke ({
      app: 'volt',
      mark,
      json,
    });

    return p;
  }

  const scry = async (app, path) => {
      const s = await data.airlock.scry({app, path});
      return s;
  }

  const urbit = [
    data,
    {
      sendPoke({pokeType, json}, err, callback) {
        poke(pokeType, json).catch(err).then(callback);
      },

      setState(path: string[], data) {
        setData("state", ...path, data);
      },

      addChannel(channelType, channel) {
          setData("state", "channels", channelType, produce((channels) => {
              channels.push(channel);
          }));
      }
    }
  ];

  return (
    <UrbitContext.Provider value={urbit}>
      {props.children}
    </UrbitContext.Provider>
  );
}
