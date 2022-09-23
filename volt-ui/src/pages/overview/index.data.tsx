import { useContext } from "solid-js";
import { UrbitContext } from "../../logic/api";
import { openChannel, createFunding } from "../../logic/commands";
import { createStore } from "solid-js/store"

function checkValid({ element, validators = [] }, setErrors) {
  return async () => {
    element.setCustomValidity("");
    element.checkValidity();
    let message = element.validationMessage;
    if (!message) {
      for (const validator of validators) {
        const text = await validator(element);
        if (text) {
          element.setCustomValidity(text);
          break;
        }
      }
      message = element.validationMessage;
    }
    if (message) {
      setErrors({ [element.name]: message });
    }
  };
}

function callbacks(api) {
    const submitPsbt = (form) => {
        let id = form.id || "";
        /*
        let hex = []
        bin.split('').forEach(function(ch) {
            let h = ch.charCodeAt(0).toString(16);
            if (h.length % 2)  h = '0' + h;
            hex.push(h);
        });

        let id = BigInt('0x' + hex.join('')).toString();
        */

        let psbt = form.elements['psbt'].value;
        let json = createFunding(id, psbt);
        console.log(json);
        api.sendPoke(
            json,
            (err) => {},
            (data) => {console.log(data);}
        );
    };

    const newChannelRequest = (form) => {
        let who: string = form.elements['who'].value;
        let funding: number = parseInt(form.elements['funding'].value);
        who = who.charAt(0) === '~' ? who : '~' + who;
        let json = openChannel(who, funding, 0, "testnet");
        api.sendPoke(
            json,
            (err) => {},
            (data) => {console.log(data);}
        );
    };

    return {newChannelRequest, submitPsbt};
}
export default function OverviewData() {
    const [errors, setErrors] = createStore({}),
          fields = {};

    const validate = (ref, accessor) => {
        const validators = accessor() || [];
        let config;
        fields[ref.name] = config = { element: ref, validators };
        ref.onblur = checkValid(config, setErrors)
        ref.oninput = () => {
            if(!errors[ref.name]) return;
            setErrors({[ref.name]: undefined});
        };
    };

    const formSubmit = (ref, accessor) => {
        const callback = accessor() || (() => {});
        ref.setAttribute("novalidate", "");
        ref.onsubmit = async (e) => {
            e.preventDefault();
            switch(callback.name) {
                case "newChannelRequest":
                    const who = fields["who"];
                    await checkValid(who, setErrors)();
                    if(who.element.validationMessage) field.element.focus();
                    else callback(ref);
                    break;
                case "submitPsbt":
                    callback(ref);
            }
        };
    };

    const [data, api] = useContext(UrbitContext);
    const functions = callbacks(api);

    return {data, validate, formSubmit, errors, functions};
}
