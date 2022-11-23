import {scale, translate, transform, toString} from 'transformation-matrix';
import { sigil, stringRenderer }  from '@tlon/sigil-js';
import { Component } from 'solitd-js';
import sigils from './sigils.json';
import { validateName } from '../../util';

type SigilProps = {
    patp: string,
    colors: [string, string],
    attributes: any,
    style: any,
    className: string,
    width: number,
    height: number,
    margin: number
};

const UNIT_GRID = [
    {x: 0, y: 0},
    {x: 128, y: 0},
    {x: 0, y: 128},
    {x: 128, y: 128},
];

const ITEMS = {
    "line": (attributes) => <line {...attributes}></line>,
    "circle": (attributes) => <circle {...attributes}></circle>,
    "path": (attributes) => <path {...attributes}></path>,
}


export const Sigil: Component<Sigil> = (props: SigilProps) => {
    props = {...props};

    if (typeof props.colors === 'undefined') {
        props.colors = ['var(--base03)', 'var(--bg)'];
    }

    if (typeof props.attributes === 'undefined') {
        props.attributes = {};
    }

    if (typeof props.style === 'undefined') {
        props.style = {};
    }

    if (typeof props.className === 'undefined') {
        props.className = '';
    }

    let error = validateName({name: props.patp});
    console.assert(error, false);

    let phonemes = props.patp.replace(/[\^~-]/g, '').match(new RegExp('.{1,3}','g'));
    let patpDidPass = phonemes.length > 0;

    let symbols = phonemes.map(phoneme => {
        // @ts-ignore
        const ast = sigils[phoneme];
        if (typeof ast === 'undefined') {
            patpDidPass = false;
            return {};
        } else {
            return JSON.parse(JSON.stringify(ast));
        }
    });

    console.assert(
        patpDidPass, '%s',
        `needs a valid patp (point name). Patp field is invalid. Recieved ${props.patp}`
    );

    const grid = UNIT_GRID.slice(0, symbols.length);

    // Move each symbol into it's new x/y position on a unit rectangle sized 256 by 256.
    for (let i = 0; i < grid.length; i++) {
        const positionTransform = toString(translate(grid[i].x, grid[i].y));
        if (symbols[i].attributes === undefined) {
        symbols[i].attributes = {};
        }
        symbols[i].attributes.transform = positionTransform;
    }

    let resizeRatio = 0.4;

    const symbolSize = {
        x: props.width * resizeRatio,
        y: props.height * resizeRatio,
    };

    const marginPx = {
        x: (props.width  - ((symbols.length > 1) + 1)  * symbolSize.x) / 2,
        y: (props.height - (symbols.length/4 + 1)      * symbolSize.y) / 2,
    };

    // Calculate how much the symbolsGroups should change in scale. 128 is the unit size of the SVGs as drawn in their source file.
    const symbolsGroupScale = symbolSize.x / 128;

    // First translate the symbols group to a centered x/y position, then scale the group to it's final size.
    const scaleAndCenteringTransform = toString(
        transform(translate(marginPx.x, marginPx.y), scale(symbolsGroupScale, symbolsGroupScale))
    );

    let getColor = (s) => s === "@FG" ? props.colors[1] : s === "@BG" ? props.colors[0] : "";

    let strokeWidth = props.width / 128 + 0.33;

    let elems = symbols.map((symbol) => {
        symbol.children = symbol.children.map((item) => {
            item.attributes.fill = getColor(item.attributes.fill);
            item.attributes.stroke = getColor(item.attributes.stroke);
            item.attributes['stroke-width'] = strokeWidth + 'px';
            item.attributes['stroke-linecap'] = 'square';
            item.attributes['vector-effect'] = 'non-scaling-stroke';
            let i = ITEMS[item.name](item.attributes);
            return i
        });
        return <g {...symbol.attributes}>{symbol.children}</g>;
    });

    return (
        <svg viewBox={`0 0 ${props.width} ${props.height}`}
             class={props.className}
             style={{
                display: "block",
                width: props.width + "px",
                height: props.height + "px",
                margin: props.margin + "px"
             }}
             xmlns>
            <rect fill="var(--fg)"
                  width={props.width}
                  height={props.height}
                  x="0px"
                  y="0px">
            </rect>
            <g transform={scaleAndCenteringTransform}>
                {elems}
            </g>
        </svg>
    )
}
