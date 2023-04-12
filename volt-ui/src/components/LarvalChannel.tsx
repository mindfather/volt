import { Component, createSignal, useContext } from 'solid-js';
import { LarvalChannel as LarvalChannelProps} from "../types/state";
import { Sigil } from "./Sigil";
import { Sign, Remove } from "../assets/icons";
import { ActionButton } from "./ActionButton";
import { Loading } from "./Loading";
import { BitcoinValue } from "./BitcoinValue";
import { Clickable } from "./Clickable";
import { closeChannel } from "../logic/commands";
import { VoltContext } from "../logic/api";

/* <Clickable content={props.address} maxLength={20} /> */
export const LarvalChannel: Component<LarvalChannelProps> = (props) => {
    const [_, api] = useContext(VoltContext);
    const [deleted, markForDeletion] = createSignal(false);
    let sigilConfig = {
        width:  64,
        height: 64
    };

    const cancelChannel = () => {
        if(deleted()) return;
        return api.sendPoke(
            closeChannel(props.channelId),
            (err) => {
                console.log(err);
            },
            (res) => markForDeletion(true)
        );
    }

    return (
        <div style={{
            'display':'flex',
            'padding': '5px',
            'justify-content': 'space-between',
            'align-items': 'center',
            'border-bottom': '1px solid var(--base1)',
            'text-align': 'start',
            'max-height': '72px',
        }}>
            <span style={{'width': '64px !important'}}>
                <Sigil patp={props.who} {...sigilConfig} />
            </span>
            <div style={{
                'min-height': '64px',
                'width':'100%',
                'display': 'flex',
                'flex-direction': 'column',
                'justify-content': 'space-between',
                'margin': '0 10px'
            }}>
                <div style={{
                    'display': 'flex',
                    'flex-direction': 'row',
                    'justify-content': 'space-between'
                }}>
                    <span style={{'font-size': '32px'}}>
                        ~{props.who}
                    </span>
                </div>
                <span style='align-self:start;'>
                    Capacity: <BitcoinValue satsbalance={props.capacity} />
                </span>
            </div>
            <Show when={deleted()}
                  fallback={<>
                    <ActionButton onClick={() => {}}
                                style={{'width': '96px', 'height': '64px', 'margin-right': '6px'}}
                                iconStyle={{'height': '32px', 'margin-left': '10px'}}
                                fontSize='14px'
                                icon={Sign}
                                label='Fund'/>
                    <ActionButton onClick={() => cancelChannel()}
                                style={{'width': '96px', 'height': '64px'}}
                                iconStyle={{'height': '32px'}}
                                hoverColor="var(--red)"
                                fontSize='14px'
                                icon={Remove}
                                label='Cancel'/>
                    </>}>
                <Loading style={{'margin-right': '6px'}}
                         width="72px"
                         height="60px"
                         color="var(--red)"
                         label='Cancelling'
                         button />
            </Show>
        </div>
    );
}
