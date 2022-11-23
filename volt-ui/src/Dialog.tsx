import { Component, createSignal } from 'solid-js';
import { Portal } from "solid-js/web";
import { XMark } from "./assets/icons.tsx";

type DialogProps = {
    component: any,
    close: any,
    title: string
};

export const Dialog: Component<DialogProps> = (props) => {
    const [hover, setHover] = createSignal(false);

    return (
        <Portal>
            <Show when={props.component != null}>
                <div style={{
                    width: "100%",
                    height: "100%",
                    position: "fixed",
                    'backdrop-filter': 'blur(2px)',
                    top: 0,
                    left: 0
                }}>
                    <div id="Dialog"
                         style={{
                            'position': 'fixed',
                            'top':'50%',
                            'left':'50%',
                            'transform': 'translate(-50%, -50%)',
                            'border': '2px solid var(--base0)',
                            'background-color': 'var(--hl)',
                    }}>
                        <div id="DialogHeader"
                             style={{
                                'padding': '8px 12px',
                                'display': 'flex',
                                'flex-direction': 'row',
                                'justify-content': 'space-between',
                                'border-bottom': '1px solid var(--base0)'
                        }}>
                            <span style={{
                                'font-size': '24px',
                                'font-weight': '500',
                                'margin-right': '20px'
                            }}>
                                {props.title}
                            </span>

                            <span style='cursor: pointer;'
                                  onMouseEnter={() => setHover(true)}
                                  onMouseLeave={() => setHover(false)}
                                  onClick={() => props.close()}>
                                <XMark style={{
                                    'width': '24px',
                                    'height': '24px',
                                    'fill': 'var(--base0)'
                                }} />
                            </span>
                        </div>

                        <div id='DialogContent'
                             style={{
                                 'padding': '8px 12px;',
                                 'margin': '12px',
                             }}>
                            {props.component}
                        </div>
                    </div>
                </div>
            </Show>
        </Portal>
    );
}
