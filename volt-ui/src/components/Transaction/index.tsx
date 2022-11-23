import { Component, createMemo, createSignal, createResource } from 'solid-js';
import { Sigil } from "../Sigil"
import { BitcoinValue } from "../BitcoinValue"
import { fetchRates } from "../../util";
import { ArrowDown, ArrowUp, ArrowRight } from "../../assets/icons.tsx";
import { Transaction as T } from "../../types/state";

import styles from "./Transaction.module.css";

type TransactionProps = T & { rates: any };

const fiatFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export const Transaction: Component<TransactionProps> = (props) => {
    const fiatBalance = createMemo(() => {
        if(props.rates === null)
            return;
        let balance = props.rates["price_24h"] * props.amount / Math.pow(10, 8);
        return fiatFormatter.format(balance);
    });

    let sigilConfig = {
        width:  40,
        height: 40
    };

    return (
        <div class={styles.transaction}>
            <div class={styles.info}>
                <div class={styles.icon}>
                    <ArrowUp />
                </div>
                <div class={styles.action}>
                    Sent
                    <span class={styles.timestamp}>
                        at {(new Date(props.timestamp)).toLocaleTimeString()}
                    </span>
                </div>
            </div>

            <span class={styles.from}>
                <Sigil patp={props.payer} {...sigilConfig} />
                {props.payer}
            </span>
            <ArrowRight class={styles.arrow} />
            <span class={styles.to}>
                <Sigil patp={props.payee} {...sigilConfig} />
                {props.payee}
            </span>

            <div class={styles.amount}>
                <span class={styles.sats}>
                    -<BitcoinValue satsbalance={props.amount} />
                </span>
                <span class={styles.fiat}>
                    ~{fiatBalance()}
                </span>
            </div>
        </div>
    );
}
