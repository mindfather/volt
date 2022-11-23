import { Component, createMemo, useContext } from 'solid-js';
import { createStore } from "solid-js/store";
import { checkValid, validatorBuilder, formSubmitBuilder, validateName } from "../util";
import { VoltContext } from "../logic/api";
import { sendPayment } from "../logic/commands";

import styles from "./Requests.module.css";

const SendPayment : Component<any> = (props) => {
    const [state, api] = useContext(VoltContext);

    const [errors, setErrors] = createStore({}),
          fields = {};
    const validate = validatorBuilder(fields, errors, setErrors);

    const formSubmit = formSubmitBuilder(async (e, ref, callback) => {
        const payer = fields["payer"];
        await checkValid(payee, setErrors)();
        if(payer.element.validationMessage) payee.element.focus();
        else callback(ref);
    });

    const sendPayment = (form) => {
        let json = addInvoice(
            form.payee.value || "",
            parseInt(form.amount.value) || 0,
            form.memo.value   || "",
            "testnet"
        );

        api.sendPoke(
            json,
            (err) => {console.log(err);},
            (data) => {console.log(data);}
        );
    };

    return (
        <div class="send">
                    <form id="sendPayment"
                          use:formSubmit={sendPayment}
                          class={styles.form}>

                        {errors.provider && <ErrorMessage error={errors.provider} class="error"/>}

                        <div class={styles.formHeader}>
                            <span class={styles.payee}>
                                <h5 class={styles.label}>From:</h5>
                                <input
                                    name="payee"
                                    class={styles.input}
                                    placeholder="e.g. ~fed"
                                    use:validate={[validateName]}
                                />
                            </span>
                            <span class={styles.amount}>
                                <h5 class={styles.label}>Amount:</h5>
                                <input
                                    name="amount"
                                    type="number"
                                    class={styles.input}
                                    placeholder="Amount to request in msats"
                                />
                            </span>
                        </div>

                        <textarea
                            name="memo"
                            type="text"
                            placeholder="e.g. for a Large Fry"
                            class={styles.memo}
                        />

                        <button type="submit"
                                class={styles.submit}>
                            <span class="submit">Request</span>
                        </button>
                    </form>
                </div>
    );
}

export const SendPaymentDialog = {
    title: "Send Bitcoin",
    component: SendPayment,
};
