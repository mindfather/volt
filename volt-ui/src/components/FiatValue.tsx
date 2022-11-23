import { Component, Show, createMemo } from 'solid-js';

type FiatProps = {
    sats: number,
    rates: any;
}

const fiatFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export const FiatValue: Component<FiatProps> = (props) => {
    props.currency = props.currency || "USD";
    const fiatBalance = createMemo(() => {
        if(props.rates === null)
            return;
        let balance = props.rates["price_24h"] * props.sats / Math.pow(10, 8);
        return fiatFormatter.format(balance);
    });

    return (
        <>
            {fiatBalance()}
        </>
    );
}
