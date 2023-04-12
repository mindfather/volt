import { Component, createSignal } from 'solid-js';
import { Portal, Dynamic } from "solid-js/web";

type DialogProps = {
    component: any,
    close: any,
    style: any,
    title: string

};

export const Dialog: Component<DialogProps> = (props) => {
    const [hover, setHover] = createSignal(false);

    return (
        <Portal>
            <Show when={props.component != null}>
                <div id='DialogBackdrop'
                     onClick={() => { console.log(props.component); props.close()}}
                     style={{
                        width: "100%",
                        height: "100%",
                        position: "fixed",
                        'backdrop-filter': 'blur(2px)',
                        top: 0,
                        left: 0
                     }}>
                    <div id="Dialog"
                         onClick={(e) => e.stopPropagation()}
                         style={{
                            'position': 'fixed',
                            'top':'50%',
                            'left':'50%',
                            'box-shadow': '0px 0px 4px 0.2px var(--base0)',
                            'transform': 'translate(-50%, -50%)',
                            'border': '1px solid var(--base1)',
                            'border-radius': '8px',
                            'background-color': 'var(--base3)',
                            'padding': '12px',
                             ...(props.style)
                    }}>
                        <Dynamic component={props.component} />
                    </div>
                </div>
            </Show>
        </Portal>
    );
}
