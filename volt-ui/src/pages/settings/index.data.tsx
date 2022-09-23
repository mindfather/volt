import { useContext } from "solid-js";
import { UrbitContext } from "../../logic/api";
import { setProvider, setBTCProvider } from "../../logic/commands";
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
    const onSuccess = (provider, ship, form) => {
        api.setState([provider], {
            ship,
            connected: null
        });
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
        api.sendPoke(
            setProvider(provider),
            (err) => {},
            (_) => onSuccess('provider', provider, form)
        );
    };

    const setBTCProviderNode = (form) => {
        let provider: string = form.elements['btcprovider'].value;
        provider = provider.charAt(0) === '~' ? provider : '~' + provider;
        api.sendPoke(
            setBTCProvider(provider),
            (err) => {},
            (_) => onSuccess('provider', provider, form)
        );
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

