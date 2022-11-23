import { Component, createMemo } from 'solid-js';
import { LiveChannel as LiveChannelProps } from "../types/state";
import { Sigil } from "./Sigil";
import { Clickable } from "./Clickable";
import { BitcoinValue } from "./BitcoinValue";

const row = {
    'display': 'flex',
    'flex-direction': 'row',
    'justify-content': 'space-between'
};

export const LiveChannel: Component<LiveChannelProps> = (props) => {

    let sigilConfig = {
        width:  64,
        height: 64
    };

    return (
        <div style={{
            'display':'flex',
            'padding': '5px',
            'border-bottom': '1px solid var(--base1)',
            'text-align': 'start',
        }}>
            <Sigil patp={props.who} {...sigilConfig} />

            <div style={{
                'min-height': '64px',
                'width':'100%',
                'display': 'flex',
                'flex-direction': 'column',
                'justify-content': 'space-between',
                'margin': '0 0 0 10px'
            }}>

                <div style={row}>
                    <span style={{'font-size': '32px'}}>~{props.who}</span>
                    <Clickable content={props.channelId} maxLength={20} />
                </div>

                <div style={row}>
                    <span>
                        Balance: <BitcoinValue msatsbalance={props.balance} /> / <BitcoinValue satsbalance={props.capacity} />
                    </span>

                    <span>
                        {props.state}
                    </span>
                </div>

            </div>
        </div>
    );
}
