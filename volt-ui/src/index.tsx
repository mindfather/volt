/* @refresh reload */
import {lazy} from "solid-js";
import { render } from 'solid-js/web';
import { Router, useRoutes } from "@solidjs/router";
import { UrbitProvider, createUrbit} from './logic/api';

import routes from "./routes"
import './index.css';

export const Outlet = useRoutes(routes);

let urbit = await createUrbit();

render(
    () => (
        <UrbitProvider {...urbit}>
            <Router routes={routes} root={process.env.PUBLIC_URL}>
                <Outlet />
            </Router>
        </UrbitProvider>
    ),
    document.body
);
