import { useRouteData } from "@solidjs/router";

export default function Overview() {
    const {api} = useRouteData();
    const overview = useRouteData();
    return (
        <div class="overview">
            <button onclick={api.s}></button>
        </div>
    );
}
