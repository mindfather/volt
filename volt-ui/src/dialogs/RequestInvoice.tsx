import { Component, createSignal, createMemo, useContext } from 'solid-js';
import { createStore } from "solid-js/store";
import { checkValid, validatorBuilder, formSubmitBuilder, validateName } from "../util";
import { VoltContext } from "../logic/api";
import { addInvoice } from "../logic/commands";
import { FiatValue } from "../components/FiatValue";

import styles from "./Requests.module.css";

const RequestInvoice: Component<any> = (props) => {
    const [state, api] = useContext(VoltContext);

    const [errors, setErrors] = createStore({}),
          fields = {};
    const validate = validatorBuilder(fields, errors, setErrors);
    let [amount, setAmount] = createSignal(0);
    let [submitted, setSubmitted] = createSignal(false);

    const formSubmit = formSubmitBuilder(async (e, ref, callback) => {
        callback(ref);
    });

    const requestPayment = (form) => {
        let json = addInvoice(
            parseInt(form.amount.value),
            form.memo.value || "",
            state.network
        );
        api.sendPoke(
            json,
            (err) => {},
            (data) => {console.log(data);}
        );
        setSubmitted(true);
    };

    return (
        <Show when={state.payreq == null} fallback={
            <span style={{
                'max-width': '200px',
            }}>{state.payreq}</span>
        }>
            <form id="requestPayment"
                use:formSubmit={requestPayment}
                class={styles.form}>
                {errors.provider && <ErrorMessage error={errors.provider} class="error"/>}
                {/*
                    TODO: Handle Directed Requests in the agent
                    <span class={styles.payer}>
                        <span class={styles.label} style='top:1px;'>From</span>
                        <input
                            name="payer"
                            class={styles.input}
                            placeholder="~fed"
                            use:validate={[validateName]}
                        />
                    </span>
                */}
                <span class={styles.top}>
                    <span class={styles.amount}>
                        <span class={styles.sats}>
                            <span class={styles.label}>msats</span>
                            <input oninput={(amount) => {setAmount(amount.target.value)}}
                                name="amount"
                                type="number"
                                disabled={submitted()}
                                class={styles.input}
                                placeholder="Amount to request in msats" />
                        </span>
                        <span class={styles.fiat}>
                            <span class={styles.label}>USD</span>
                            <span class={styles.fiatvalue} style='bottom:1px;'><FiatValue sats={amount()} rates={state.exchangerates} /></span>
                        </span>
                    </span>
                    <button type="submit"
                            class={styles.submit}>
                        Generate Request
                    </button>
                </span>
                <textarea
                    name="memo"
                    type="text"
                    disabled={submitted()}
                    placeholder="e.g. for a Large Fry"
                    class={styles.memo}
                />
            </form>
        </Show>
    );
}

export const RequestInvoiceDialog = {
    title: "Request a Payment",
    component: RequestInvoice,
};
