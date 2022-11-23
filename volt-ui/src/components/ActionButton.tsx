import { Component, createSignal, createMemo } from 'solid-js';

type ActionButtonProps = {
    icon: any;
    onClick: () => void;
    label: string;
    position: {left: string};
    style: any;
    hoverColor: string;
    iconStyle: any;
    fontSize: string;
};

export const ActionButton: Component<ActionButtonProps> = (props) => {
    props.style = props.style || {
        'width': '100%',
        'height': '100%',
    };
    props.hoverColor = props.hoverColor || "var(--green)";
    props.iconStyle = props.iconStyle || {'height': '40%'};
    props.fontSize = props.fontSize || "18px";
    const Icon = props.icon;
    const [hover, setHover] = createSignal(false);

    return (
        <button id="send"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    ...(props.style),
                    'display': 'flex',
                    'flex-direction':'column',
                    'align-items': 'center',
                    'justify-content': 'space-around',
                    'border': '2px solid var(--fg)',
                    'background-color': 'var(--bg)',
                    ...(hover() && {
                        'cursor': 'pointer',
                        'background-color': 'var(--hl)',
                        'border-color':props.hoverColor,
                        'transition': 'background-color 0.5s, border-color 0.5s',
                    }),
                }}
                onClick={props.onClick}>
            <Icon style={{
                'fill': 'var(--fg)',
                ...(props.iconStyle),
                'transition': 'background-color 0.5s, border-color 0.5s',
                ...(hover() && {
                    'fill':props.hoverColor,
                    'transition': 'fill 0.5s'
                }),
            }} />
            <span style={{
                    'font-size': props.fontSize,
                    ...(!hover() && {
                        'color': 'var(--fg)',
                    }),
                    ...(hover() && {
                        'color': props.hoverColor,
                        'transition': 'color 0.5s',
                    }),
            }}>
                {props.label}
            </span>
        </button>
    );
}
