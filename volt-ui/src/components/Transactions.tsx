import { Component, createMemo } from 'solid-js';
import { Transaction } from "./Transaction";
import { Transaction as TransactionStruct } from "../../types/state";

type TransactionsProps = {
    transactions: Map<string,TransactionStruct[]>;
    rates: any;
}

export const Transactions: Component<TransactionsProps> = (props) => {
    const transactions = createMemo(() => Array.from(props.transactions.entries()));

    return (
        <div style={{
            'grid-row':         'transactions-start / transactions-end',
            'grid-column':      'start / end',
            'width':            '100%',
            'display':          'flex',
            'flex-direction':   'column',
            'margin':           '0 0 32px 0',
            'overflow-y':       'overlay',
            'border':           '2px solid var(--base01)',
            'background-color': 'var(--bg)'
        }}>
            <For each={transactions()}>{(entry) =>
                <div class="date-block">
                    <div style={{
                        'margin':           '0',
                        'background-color': 'var(--hl)',
                        'color': 'var(--base02)',
                        'padding':          '5px 10px'
                    }}>{entry[0]}</div>
                    <For each={entry[1]}>{(transaction) =>
                        <Transaction {...transaction} rates={props.rates} />
                    }</For>
                </div>
            }</For>
        </div>
    );
}
