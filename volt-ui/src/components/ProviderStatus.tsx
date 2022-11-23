import { Component, createMemo, createSignal, createEffect, useContext } from 'solid-js';
import { VoltContext } from "../logic/api";
import { Sign, Save, XMark, Lightning, Bitcoin } from '../assets/icons';
import { validateName } from '../util';

type ProviderStatusProps = {
    icon: any,
    providertype: "btcprovider" | "provider",
    action: any
};

const getClass = (connected: boolean) => {
    switch(connected) {
            case null: return "var(--yellow)";
            case true: return "var(--green)";
            case false: return "var(--red)";
    }
}

const getString = (connected: boolean) => {
    switch(connected) {
            case null: return "Connecting";
            case true: return "Connected";
            case false: return "Not Connected";
    }
}

export const ProviderStatus: Component<ProviderStatusProps> = (props) => {
    const Icon = props.providertype == "btcprovider" ? Bitcoin : Lightning;
    const [state, api] = useContext(VoltContext);
    const [hover, setHover] = createSignal(false);
    const [editing, setEditing] = createSignal(false);
    const provider = createMemo(() => state[props.providertype]);
    const providerClass = createMemo(() => getClass(provider().connected));
    const providerTitle = createMemo(() => getString(provider().connected));

    let inputRef: HTMLInputElement;

    createEffect(() => {
        const isEditing = editing();
        if(isEditing) inputRef.focus();
        return isEditing;
    });

    const submit = (input) => {
        let error = validateName(input);

        if(error) return;
        let ship = `~${input}`;
        return api.sendPoke(
            props.action(ship),
            (err) => {
                console.log(error);
            },
            (res) => {
                api.setState(props.providertype, {ship, connected: null});
                setEditing(false);
            }
        );
    };

    return (
        <div onMouseEnter={() => setHover(true)}
             onMouseLeave={() => setHover(false)}
             class={props.class || ""}
             style={{
            'display': 'flex',
            'justify-content': 'space-between',
            'align-items': 'center',
            'height': '28px',
            'background-color': 'var(--bg)',
            'border': '2px solid var(--base01)',
            'min-width': '80px',
            'padding': '2px 7.5px',
            'border-radius': '10px',
            'text-align': 'center',
            'user-select': 'none',
            ...(hover() && {
                 'background-color': 'var(--hl)',
                 'transition': 'background-color 0.2s',
                 'cursor': 'default'
            }),
            ...(editing() && {
                'min-width': '220px',
                'transition': 'min-width 0.2s ease-in-out'
            })
        }}>
            {/* Left-hand icons */}
            <span style={{
                'display': 'flex',
                'align-items': 'center'
            }}>
                <Icon style={{
                    'width': '24px',
                    'height': '24px',
                }} />

                <Sign onClick={() => setEditing(true)}
                    style={{
                        'display': 'block',
                        'fill': 'var(--bg)',
                        'height': '14px',
                        'margin': '0 8px',
                        'cursor': 'pointer',
                        ...(hover() && {
                            'fill': 'var(--base1)',
                            'transition': 'fill 0.2s',
                        }),
                        ...(editing() && {
                            'display': 'none',
                        })
                    }}
                />
            </span>

            {/* Provider Display */}
            <span title={providerTitle()}
                  style={{
                'max-width': '200px',
                'opacity': '100%',
                'color': providerClass(),
                'display': 'block',
                'font-size': '22px',
                ...(editing() && {
                    'opacity': '0',
                    'max-width': '0',
                })
            }}>
                {provider().ship}
            </span>

            {/* Edit Provider */}
            <div style={{
                'display': 'flex',
                'visibility':  'hidden',
                'max-width': '0px',
                'font-size': '22px',
                'align-items': 'center',
                ...(editing() && {
                    'visibility': 'visible',
                    'max-width': '200px',
                })
            }}>
                <span style="margin-left: 2px">~</span>
                <input ref={inputRef!}
                    style={{
                        'background': 'transparent',
                        'outline': 'none',
                        'max-width': '0px',
                        'font-size': '22px',
                        'border': 'none',
                        'margin-left': '0',
                        ...(editing() && {
                            'max-width': '140px',
                        })
                    }} />
                <span style={{
                    'display': 'flex',
                    'align-items': 'center',
                    'opacity': '0%',
                    'max-width': '0px',
                    ...(editing() && {
                        'max-width': '40px',
                        'opacity': '100%',
                    })
                }}>
                    <XMark onClick={() => setEditing(false)}
                            style={{
                                'fill': 'var(--base1)',
                                'height': '18px',
                                'width': '18px',
                                'margin-right': '4px',
                                'cursor': 'pointer',
                            }}
                    />
                    <Save onClick={() => submit(inputRef.value)}
                            style={{
                                'fill': 'var(--base1)',
                                'height': '18px',
                                'width': '18px',
                                'cursor': 'pointer',
                            }}
                    />
                </span>
            </div>
        </div>
    );
}
