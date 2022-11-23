import { Component, Show, createSignal, createMemo } from 'solid-js';
import { Clipboard, Check } from '../assets/icons';

type ClickableProps = {
   content: string;
   maxLength: number;
};

export const Clickable: Component<ClickableProps> = (props) => {
    let [copied, setCopied] = createSignal(false);
    let [hover, setHover] = createSignal(false);
    let iconClass = createMemo(() => { return {
        'fill': 'var(--base1)',
        'width': '14px',
        'height': '14px',
        'opacity': '0%',
        'margin-top': 'auto',
        'margin-bottom': 'auto',
        ...(hover() && {
            'opacity': '100%',
            'transition': 'opacity 0.25s'
        }),
        ...(copied() && {
            'fill': 'var(--green)'
        })
    }});
    props.maxLength = props.maxLength || props.content.length;
    const copyToClipboard = (event) => {
        setCopied(true);
        navigator.clipboard.writeText(props.content);
        setTimeout(() => {
            setCopied(false);
        }, 1000)
    }

    return (
        <span onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                'padding': '1px 6px 1px 8px',
                'font-size': '14px',
                'background-color': 'var(--hl)',
                'border-radius': '10px',
                'margin-top': 'auto',
                'margin-bottom': 'auto',
                'cursor':'pointer',
                'display':'flex',
                'justify-content':'space-between',
                'align-items': 'center',
        }}
              onClick={copyToClipboard}>
            <span style={{
                'max-width': props.maxLength + 'ch',
                'text-overflow': 'ellipsis',
                'overflow-x':'hidden',
                'padding-right': '4px',
            }}>
                {props.content}
            </span>
            <Show when={copied()} fallback={<Clipboard style={iconClass()} />}>{<Check style={iconClass()} />}</Show>
        </span>
    );
}
