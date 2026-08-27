import react from "@vitejs/plugin-react"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import { stylexBabel } from "../stylex.vite.ts"

const uiRoot = fileURLToPath(new URL("..", import.meta.url))
const dist = (file: string) => `${uiRoot}dist/${file}`

export default defineConfig({
	root: fileURLToPath(new URL(".", import.meta.url)),
	plugins: [stylexBabel(uiRoot, { runtimeInjection: false }), react()],
	resolve: {
		alias: {
			"@anyknown/ui/tokens.stylex": dist("tokens.stylex.js"),
			"@anyknown/ui/themes.stylex": dist("themes.stylex.js"),
			"@anyknown/ui/tokens.css": dist("tokens.css"),
			"@anyknown/ui/scrollbar.css": dist("scrollbar.css"),
			"@anyknown/ui": dist("index.js"),
		},
	},
	server: { port: 5199, fs: { allow: [uiRoot] } },
	build: { outDir: "dist" },
})
