import { useContext } from "solid-js";
import { UrbitContext } from "../../logic/api";
import { createStore } from "solid-js/store"
import { invalidName } from "../../util/names";

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
    const onSuccess = (form) => {
        let buttonText = form.querySelector('.field > button > .submit');
        let temp = buttonText.innerHTML;
        buttonText.classList.add('success');
        buttonText.innerText = ' ✓ ';
        setTimeout(() => {
            buttonText.classList.remove('success');
            buttonText.innerHTML = temp;
        }, 1000);
    };

    const setProviderNode = (form) => {
        let provider: string = form.elements['provider'].value;
        provider = provider.charAt(0) === '~' ? provider : '~' + provider;
        api.setProvider(provider, (err) => {}, (_) => onSuccess(form));
    };

    const setBTCProviderNode = (form) => {
        let provider: string = form.elements['btcprovider'].value;
        provider = provider.charAt(0) === '~' ? provider : '~' + provider;
        api.setBTCProvider(provider, (err) => {}, (_) => onSuccess(form));
    };

    return {
      setProviderNode
    , setBTCProviderNode
    };
}

export default function SettingsData() {
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
            console.log(e);
            console.log(fields);
            e.preventDefault();
            const field = fields[e.srcElement.id];
            await checkValid(field, setErrors)();
            if(field.element.validationMessage) field.element.focus();
            else callback(ref);
        };
    };

    const [data, api] = useContext(UrbitContext);
    const functions = callbacks(api);

    return {data, validate, formSubmit, errors, functions};
}

