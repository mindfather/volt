import { Component, createSignal, createMemo } from 'solid-js';

type InputCurrencyProps = {
    style: any;
    rates: any
    sats: any
}

const fiatFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export const InputCurrency: Component<any> = (props) => {
    props.style = props.style || defaultStyle;

    let [amount, setAmount] = props.sats;
    let [fiat, toggleFiat] = createSignal(false);

    const fiatBalance = createMemo(() => {
        if(props.rates === null)
            return;
        let balance = props.rates["price_24h"] * amount() / Math.pow(10, 8);
        return fiatFormatter.format(balance);
    });

    return (
        <div style={{...(props.style)}}>
            <span>
                <input
                    style={inputStyle}
                    disabled={props.disabled}
                    placeholder='Amount in sats'
                    type="number"
                    value={amount()}
                    onInput={(e) => setAmount(parseInt(e.target.value))}/>
            </span>
            <span style={fiatFormat}>~{fiatBalance()}</span>
        </div>
    );
};

const inputStyle = {
    'background': 'transparent',
    'border': 'none',
    'outline': 'none',
    'color': 'var(--base02)',
    'font-size': '20pt'
};

const defaultStyle = {
    'display': 'flex',
    'justify-content': 'space-between',
};

const fiatFormat = {
    'color': 'var(--base1)',
    'margin-top':'auto',
    'margin-bottom':'auto',
    'font-size': '16pt'
};
