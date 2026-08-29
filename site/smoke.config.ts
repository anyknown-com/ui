import react from "@vitejs/plugin-react"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"
import { stylexBabel } from "../stylex.vite.ts"

const uiRoot = fileURLToPath(new URL("..", import.meta.url))
const dist = (file: string) => `${uiRoot}dist/${file}`

export default defineConfig({
	plugins: [stylexBabel(uiRoot), react()],
	resolve: {
		alias: {
			"@anyknown/ui/tokens.stylex": dist("tokens.stylex.js"),
			"@anyknown/ui/themes.stylex": dist("themes.stylex.js"),
			"@anyknown/ui/tokens.css": dist("tokens.css"),
			"@anyknown/ui/scrollbar.css": dist("scrollbar.css"),
			"@anyknown/ui": dist("index.js"),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		// smoke 一次 render 整個站(34 個元件),織體元件的幾何是在 render 時算的;
		// theme toggle 那題還要再 render 三次。本機約 4s,CI 的 2-core runner 會撞到
		// vitest 預設的 5s。這裡等的是「整站渲染」不是單一互動,放寬到 30s。
		testTimeout: 30_000,
		setupFiles: ["../src/test/setup.ts"],
		include: ["smoke.test.tsx"],
		root: fileURLToPath(new URL(".", import.meta.url)),
	},
})
