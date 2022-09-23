import { Component, Show, createSignal } from 'solid-js';

import clipboard from '../../assets/icons/clipboard.svg';
import check from '../../assets/icons/check.svg';
import "./clickable.scss";

type ClickableProps = {
   content: string;
};

export const Clickable: Component<ClickableProps> = (props) => {
    let [copied, setCopied] = createSignal(false);
    const copyToClipboard = (event) => {
        setCopied(true);
        navigator.clipboard.writeText(props.content);
        setTimeout(() => {
            setCopied(false);
        }, 1000)
    }

    return (
        <span class="clickable" onClick={copyToClipboard}>
            <span class="clickable-content">{props.content}</span>
            <Show when={copied()} fallback={
                <img class="icon clipboard" src={clipboard}/>
            }>
                <img class="icon check" src={check} />
            </Show>
        </span>
    );
}
