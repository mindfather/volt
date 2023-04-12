import { Component, createSignal, createMemo, useContext } from 'solid-js';
import { createStore } from "solid-js/store";
import { checkValid, validatorBuilder, formSubmitBuilder, validateName } from "../util";
import { VoltContext } from "../logic/api";
import { addInvoice } from "../logic/commands";
import { FiatValue } from "../components/FiatValue";
import { InputCurrency } from "../components/InputCurrency";
import { Clickable } from "../components/Clickable";

import styles from "./Requests.module.css";

const RequestInvoice: Component<any> = (props) => {
    const [state, api] = useContext(VoltContext);

    const [errors, setErrors] = createStore({}),
          fields = {};
    const validate = validatorBuilder(fields, errors, setErrors);

    let [amount, setAmount] = createSignal(null);
    let [submitted, setSubmitted] = createSignal(false);

    const formSubmit = formSubmitBuilder(async (e, ref, callback) => {
        callback(ref);
    });

    const requestPayment = (form) => {
       let json = addInvoice(
           amount()*1000,
           form.memo.value || "",
           state.network
       );
       api.sendPoke(
           json,
           (err) => {},
           (data) => {
               console.log(data);
           }
       );
       setSubmitted(true);
    };

    return (
        <Show when={!state.payreq} fallback={
            <span style={{
                'max-width': '200px',
                'word-break': 'break-word'
            }}>
                <div class={styles.generated}>
                    <div class={styles.header}>
                        <h3 class={styles.success}>Request Generated!</h3>
                        <p>Send this request to the user that you wish to receieve payment from:</p>
                    </div>
                    <div class={styles.payreq}>
                        <Clickable content={state.payreq} />
                    </div>
                </div>
            </span>
        }>
            <form id="requestPayment"
                use:formSubmit={requestPayment}
                class={styles.form}>

                {errors.provider && <ErrorMessage error={errors.provider} class="error"/>}

                <span class={styles.amount}>
                    <InputCurrency rates={state.exchangerates}
                                   disabled={submitted()}
                                   sats={[amount, setAmount]}
                    />
                </span>

                <textarea
                    name="memo"
                    type="text"
                    disabled={submitted()}
                    placeholder="Memo (e.g. for a Large Fry)"
                    class={styles.memo}
                />

                <button type="submit"
                        class={styles.submit}>
                    { submitted() ? 'Generating...' : 'Generate Payment Request' }
                </button>
            </form>
        </Show>
    );
}

export const RequestInvoiceDialog = {
    title: "Request a Payment",
    component: RequestInvoice,
};

{/*
    TODO: Handle Directed Requests in the agent
    In the form...
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
