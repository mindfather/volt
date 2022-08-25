import { lazy } from "solid-js";

import OverviewData from "./pages/overview/index.data"
import SettingsData from "./pages/settings/index.data"
import LayoutData from "./pages/layout.data"

export default [
  {
    path: import.meta.env.BASE_URL,
    component: lazy(() => import("./pages/layout")),
    data: LayoutData,
    children: [
      {
        path: "/",
        component: lazy(() => import("./pages/overview")),
        data: OverviewData
      },
      {
        path: "/settings",
        component: lazy(() => import("./pages/settings")),
        data: SettingsData
      }
    ]
  }
]
