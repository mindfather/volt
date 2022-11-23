import { Component, createMemo, useContext } from 'solid-js';
import { createStore } from "solid-js/store";
import { checkValid, validatorBuilder, formSubmitBuilder, validateName } from "../util";
import { VoltContext } from "../logic/api";
import { openChannel } from "../logic/commands";

const NewChannel: Component<any> = (props) => {
    const [state, api] = useContext(VoltContext);
    const [errors, setErrors] = createStore({}),
          fields = {};
    const validate = validatorBuilder(fields, errors, setErrors);

    const formSubmit = formSubmitBuilder(async (e, ref, callback) => {
        const who = fields["who"];
        await checkValid(who, setErrors)();
        if(who.element.validationMessage) field.element.focus();
        else callback(ref);
    });

    const newChannelRequest = (form) => {
        let who: string = form.elements['who'].value;
        let funding: number = parseInt(form.elements['funding'].value);
        who = who.charAt(0) === '~' ? who : '~' + who;
        let json = openChannel(who, funding, 0, "testnet");
        api.sendPoke(
            json,
            (err) => {
                console.log('ERROR');
            },
            (data) => {
                console.log(data);
            }
        );
    };

    return (
        <div class="new-channel">
            <form id="open-channel" use:formSubmit={newChannelRequest}>
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
    );
}

export const NewChannelDialog = {
    title: "Create New Payment Channel",
    component: NewChannel,
};
