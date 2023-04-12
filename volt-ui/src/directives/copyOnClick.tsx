import { onCleanup } from "solid-js";

export function copyOnClick (el, accessor) {
    const onClick = (e) => el.contains(e.target)
                     && navigator.clipboard.writeText(props.content)
                     && accessor()?.();
    document.body.addEventListener("click", onClick);
    onCleanup(() => document.body.removeEventListener("click", onClick));
}
