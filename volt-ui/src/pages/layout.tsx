import { useRouteData, Outlet, Link } from "@solidjs/router";

import "./layout.scss";
import logo from "../assets/Lightning_Network.svg";

export default function Layout() {
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const {data: {state}} = useRouteData();

    return (
        <div class="layout">
            <div class="header">
                <Link class="title" href="/apps/volt/">
                  <img src={logo} class="logo" alt="logo" />
                  <span class="titletext">Volt</span>
                </Link>

                <div class="actions">
                    <Link class="nav" href="/apps/volt/settings">Settings</Link>
                </div>
                <div class="status">
                    <span class="provider">
                        <h6>Lightning Provider:</h6>
                        <span class={state.provider.connected == null? "connecting" : state.provider.connected ? "connected" : "disconnected" }>
                            {state.provider.ship}
                        </span>
                    </span>
                    <span class="btcprovider">
                        <h6>Bitcoin Provider:</h6>
                        <span class={state.btcprovider.connected == null? "connecting" : state.btcprovider.connected ? "connected" : "disconnected" }>
                            {state.btcprovider.ship}
                        </span>
                    </span>
                </div>
            </div>
            <div class="content">
                <Outlet/>
            </div>
        </div>
    );
}
