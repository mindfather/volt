import { Urbit } from "@urbit/http-api";
import { dummyTransactions } from "../test";

export class VoltState {
    status: string;
    subscriptionId: number;
    airlock: Urbit;
    provider: ProviderState;
    btcprovider: ProviderState;
    channels: ChannelState;
    transactions: Map<string, Transaction[]>;
    payreq: string;
    exchangerates: any;
    currency: string;
    network: string;

    constructor() {
        this.status = "try";
        this.airlock = {};
        this.subscriptionId = 0;
        this.provider = {
            ship: "",
            connected: false
        };
        this.btcprovider = {
            ship: "",
            connected: false
        };
        this.channels = {
            live: [],
            larval: []
        };
        this.transactions = new Map();
        this.exchangerates = null;
        this.currency = "USD";
        this.network = "testnet";
        this.payreq = null;
    }

    static From(props) {
      let state = new VoltState();
      state.status = props.status || state.status;
      state.airlock = props.airlock || state.airlock;
      state.subscriptionId = props.subscriptionId || state.subscriptionId;
      state.provider = props.provider || state.provider;
      state.btcprovider = props.btcprovider || state.btcprovider;
      state.channels = props.channels || state.channels;
      state.transactions = props.transactions || state.transactions;
      return state;
    }
}

export type ProviderState = {
    ship: string;
    connected: boolean;
}

export type ChannelState = {
    live: LiveChannel[];
    larval: LarvalChannel[];
}

export interface Channel {
    channelId: string;
    address: string;
    capacity: number;
    who: string;
}

export class LiveChannel implements Channel {
    state: string;
    balance: number;
}

export class LarvalChannel implements Channel {}

export type Transaction = {
    timestamp: number;
    payer: string;
    payee: string;
    amount: number;
}
