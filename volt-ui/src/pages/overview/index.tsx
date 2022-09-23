import { useRouteData } from "@solidjs/router";
import { createSignal, createResource } from "solid-js";
import { invalidName } from "../../util";
import { Clickable } from "../../components/clickable/clickable";

import "./overview.scss";

const fetchRates = async () =>
    (await fetch('https://blockchain.info/ticker')
        .then((res) => res.json())
        .then((cr) => {
            let newCurrencyRates = {};
            for(let c in cr) {
                newCurrencyRates[c] = cr[c];
                newCurrencyRates[c].symbol = c === "USD" ? "$" : c;
            }
            return newCurrencyRates;
    }));

export default function Overview() {
    const {data: {state}, validate, formSubmit, errors, functions: {submitPsbt, newChannelRequest}} = useRouteData();

    const validateName = (input) => {
        return invalidName(input.value);
    };

    return (
        <div class="overview">
            <h1>Overview</h1>
            <div class="transactions">
                <h2>Transactions</h2>
            </div>
            <div class="channels">
                <h2>Channels</h2>

                <div class="larval-channels">
                    <h2>Awaiting Funding Signature</h2>

                    <table><tbody>
                        <tr>
                            <th>ID</th>
                            <th>Address</th>
                            <th>PSBT</th>
                        </tr>

                        <For each={state.channels.larval}>{(chan, i) => (
                            <tr class="channel">
                                <td class="id">
                                    <div class="tooltip">
                                        {i() + 1}
                                        <span class="tooltiptext">
                                            <Clickable content={chan.temporaryChannelId} />
                                        </span>
                                    </div>
                                </td>

                                <td class="address">
                                    <Clickable content={chan.address} />
                                </td>

                                <td class="psbt">
                                    <form id={chan.temporaryChannelId} use:formSubmit={submitPsbt}>
                                        <input name="psbt"/>
                                        <button type="submit">
                                            <span class="submit">Create Funding</span>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        )}</For>
                    </tbody></table>
                </div>

                <form id="open-channel" use:formSubmit={newChannelRequest}>
                    <div class="info">
                        <h2>Open A New Channel</h2>
                    </div>
                    <div class="field">
                        {errors.provider && <ErrorMessage error={errors.provider} class="error"/>}
                        <input
                            name="who"
                            placeholder="e.g. ~fed"
                            use:validate={[validateName]}
                        />

                        <input
                            name="funding"
                            type="number"
                            placeholder="Funding amount in sats"
                        />

                        <button type="submit"><span class="submit">Set</span></button>
                    </div>
                </form>
            </div>
        </div>
    );
}
