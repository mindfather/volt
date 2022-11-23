/* @refresh reload */
import {lazy} from "solid-js";
import { render } from 'solid-js/web';
import { VoltProvider } from './logic/api';
import { VoltState } from './types/state';
import Volt from './Volt';

import routes from "./routes"
import './index.css';

let voltState = new VoltState();

render(
    () => (
        <VoltProvider {...voltState}>
            <Volt />
        </VoltProvider>
    ),
    document.body
);
