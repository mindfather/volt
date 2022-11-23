import { Component, createMemo } from 'solid-js';

import { LiveChannel } from "./LiveChannel";
import { LarvalChannel } from "./LarvalChannel";
import { Sigil } from "./Sigil";
import { Clickable } from "./clickable/clickable";

import { ChannelState } from "../types/state";

type ChannelsProps = ChannelState & {style: any};

const header = {
    padding: "5px",
    'background-color': 'var(--hl)',
    'border-bottom': '1px solid var(--base00)'
}

export const Channels: Component<ChannelsProps> = (props) => {
    let sigilConfig = {
        width:  64,
        height: 64
    };

    return (
        <div style={{
                'display':          'flex',
                'flex-direction':   'column',
                'background-color': 'var(--bg)',
                'border':           '2px solid var(--base01)',
                'overflow-y':       'scroll',
                'overflow-x':       'hidden',
                ...(props.style != null && props.style)
        }}>
            <div id="LarvalChannels">
                <div style={header}>Awaiting Funding</div>
                <For each={props.larval}>{(chan, i) => (
                    <LarvalChannel {...chan} />
                )}</For>
            </div>

            <div id="LiveChannels">
                <div style={header}>Live Channels</div>
                <For each={props.live}>{(chan, i) => (
                    <LiveChannel {...chan} />
                )}</For>
            </div>
        </div>
    );
}
