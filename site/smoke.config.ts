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
		setupFiles: ["../src/test/setup.ts"],
		include: ["smoke.test.tsx"],
		root: fileURLToPath(new URL(".", import.meta.url)),
	},
})
