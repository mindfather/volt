import { Component, Show, createMemo } from 'solid-js';

type BTCProps = {
    satsbalance: number,
    msatsbalance: number,
    displayBTC: boolean,
    onClick: any
}

const formatter = new Intl.NumberFormat('en',{
    maximumSignificantDigits:3,
    notation: "compact"
});

export const BitcoinValue: Component<BTCProps> = (props) => {
    props.displayBTC = props.displayBTC || false;

    const balance = createMemo(() =>  {
        if(props.satsbalance)
            return props.satsbalance/100000000;
        if(props.msatsbalance)
            return props.msatsbalance/100000000000;
    });

    const displayString = () => props.displayBTC ? formatter.format(balance()) + ' BTC' :
                               formatter.format(props.satsbalance || props.msatsbalance) + ` ${props.msatsbalance ? 'm' : ''}sats`;

    return (
        <span onClick={props.onClick}
              style="cursor: pointer;user-select:none;">
            {displayString()}
        </span>
    );
}
