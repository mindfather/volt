import { useContext } from "solid-js";
import { UrbitContext } from "../../logic/api";

export default function OverviewData() {
    const [data, api] = useContext(UrbitContext);
    return {api};
}
