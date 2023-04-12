import { useContext, createSignal, createResource, createMemo } from "solid-js";
import { VoltContext } from "./logic/api";
import { setProvider, setBTCProvider } from "./logic/commands";

import { Dialog } from "./Dialog";
import { NewChannelDialog } from "./dialogs/NewChannel";
import { RequestInvoiceDialog } from "./dialogs/RequestInvoice";
import { SendPaymentDialog } from "./dialogs/SendPayment";
import { ProviderStatus } from "./components/ProviderStatus";
import { ActionButton } from "./components/ActionButton";
import { Balance } from "./components/Balance";
import { Channels } from "./components/Channels";
import { Transactions } from "./components/Transactions";

import { ArrowDown, ArrowUp, ArrowRight, Minus, Plus, XMark } from "./assets/icons.tsx";
import styles from './Volt.module.css';

export default function Volt() {
    const [state, api] = useContext(VoltContext);
    const [dialog, setDialog] = createSignal(null);
    const close = () => setDialog(null);

    const satsbalance = () => state.channels.live.reduce(
        (p, c) => (p.capacity || p || 0) + c.capacity, 0
    );

    api.fetchRates();

    return (
        <>
            <div class={styles.layout}>
                <div class={styles.header}>
                    <span class={styles.name}>
                        %volt
                    </span>

                    <ProviderStatus class={styles.provider}
                                    action={setProvider}
                                    providertype="provider"/>

                    <ProviderStatus class={styles.btcprovider}
                                    action={setBTCProvider}
                                    providertype="btcprovider" />
                </div>

                <div class={styles.content}
                     style={{
                        'grid-row': 'content-start / content-end',
                        'grid-column': 'web-start / web-end',
                    }}>
                    <Balance style={{
                        'grid-row': 'balance-start / balance-end',
                        'grid-column': 'balance-start / balance-end',
                    }} sats={satsbalance()} rates={state.exchangerates} />

                    <span class={styles.actions}
                          style={{
                            'grid-row': 'actions-start / actions-end',
                            'grid-column': 'actions-start / actions-end'
                          }}>
                        <ActionButton icon={ArrowUp}
                                      label="Send"
                                      onClick={() => setDialog(SendPaymentDialog)}
                                      style={{
                                          'grid-row': 'send-start / send-end',
                                      }} />
                        <ActionButton icon={Plus}
                                      label="New Channel"
                                      onClick={() => setDialog(NewChannelDialog)}
                                      style={{
                                          'grid-row': 'newchannel-start / newchannel-end'
                                      }} />
                        <ActionButton icon={ArrowDown}
                                      label="Request"
                                      onClick={() => setDialog(RequestInvoiceDialog)}
                                      style={{
                                          'grid-row': 'request-start / request-end'
                                      }} />
                    </span>

                    <Channels style={{
                        'grid-row':         'channels-start / channels-end',
                        'grid-column':      'channels-start / channels-end',
                    }}
                              live={state.channels.live}
                              larval={state.channels.larval} />

                    <Transactions transactions={state.transactions}
                                  rates={state.exchangerates} />
                </div>
            </div>

            <Dialog {...dialog()} close={close} />
        </>
    );
}
