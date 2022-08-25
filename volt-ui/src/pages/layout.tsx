import { useRouteData, Outlet, Link } from "@solidjs/router";

import "./layout.scss";
import logo from "../assets/Lightning_Network.svg";

export default function Layout() {
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const layout = useRouteData();
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
            </div>
            <div class="content">
                <Outlet/>
            </div>
        </div>
    );
}
