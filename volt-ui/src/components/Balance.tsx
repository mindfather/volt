import { Component, createMemo, createSignal, createResource } from 'solid-js';
import { BitcoinValue } from "./BitcoinValue";
import { FiatValue } from "./FiatValue";

type BalanceProps = {
    sats: number;
    currency: string;
    rates: any;
    style: any[];
}

const fiatFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export const Balance: Component<Balance> = (props) => {
    props.currency = props.currency || "USD";

    const fiatBalance = createMemo(() => {
        if(props.rates === null)
            return;
        let balance = props.rates["price_24h"] * props.sats / Math.pow(10, 8);
        return fiatFormatter.format(balance);
    });

    return (
        <span style={{
            'border': '2px solid var(--base01)',
            'text-align': 'center',
            'display':'flex',
            'flex-direction': 'column',
            'justify-content': 'center',
            'background-color': 'var(--bg)',
            ...(props.style != null && props.style)
        }}>
            <h1 style={{'font-size': props.fontSize || "48px"}}>
                <BitcoinValue satsbalance={props.sats} />
            </h1>
            <Show when={props.rates}>
                <h3 style={{
                    'color': 'var(--base0)',
                    'font-weight': 'lighter'
                }}>
                    ~<FiatValue sats={props.sats} rates={props.rates} />
                </h3>
            </Show>
        </span>
    );
}
