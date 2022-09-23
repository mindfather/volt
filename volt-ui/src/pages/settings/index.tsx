import { useRouteData } from "@solidjs/router";
import { createStore } from "solid-js/store";
import { invalidName } from "../../util";

import "./settings.scss";


const ErrorMessage = (props) => <span class="error-message" innerHTML={props.error}></span>;

export default function Settings() {
    const {validate, formSubmit, errors, functions} = useRouteData();

    const validateName = (input) => {
        return invalidName(input.value);
    };

    return (
        <div class="page-settings">
            <h1>Settings</h1>

            <form id="provider" use:formSubmit={functions.setProviderNode}>
                <div class="info">
                    <h2>Set Provider Node</h2>
                    <p>A provider node is an urbit ship which maintains a connection to a lightning node.</p>
                </div>
                <div class="field">
                    {errors.provider && <ErrorMessage error={errors.provider} class="error"/>}
                    <input
                        name="provider"
                        placeholder="e.g. ~fed"
                        use:validate={[validateName]}
                    />
                    <button type="submit"><span class="submit">Set</span></button>
                </div>
            </form>

            <form id="btcprovider" use:formSubmit={functions.setBTCProviderNode}>
                <div class="info">
                    <h2>Set Bitcoin Provider Node</h2>
                    <p>A provider node is an urbit ship which maintains a synced Bitcoin ledger.</p>
                </div>
                <div class="field">
                    {errors.btcprovider && <ErrorMessage error={errors.btcprovider} class="error"/>}
                    <input
                        name="btcprovider"
                        placeholder="e.g. ~fed"
                        use:validate={[validateName]}
                    />
                    <button type="submit"><span class="submit">Set</span></button>
                </div>
            </form>

        </div>
    );
}

