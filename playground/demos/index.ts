import type { DemoEntry } from "../shell"
import { basicsDemos } from "./basics"
import { desktopDemos } from "./desktop"
import { formsDemos } from "./forms"
import { storageDemos } from "./storage"
import { webDemos } from "./web"

export type { DemoEntry } from "../shell"

export const DEMO_GROUPS: { title: string; demos: DemoEntry[] }[] = [
	{ title: "Forms", demos: formsDemos },
	{ title: "Basics", demos: basicsDemos },
	{ title: "Agent & chat", demos: desktopDemos },
	{ title: "Storage & data", demos: storageDemos },
	{ title: "Web shell", demos: webDemos },
]

export const DEMOS: DemoEntry[] = DEMO_GROUPS.flatMap((group) => group.demos)
