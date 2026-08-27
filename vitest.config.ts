import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import { stylexBabel } from "./stylex.vite.ts"

export default defineConfig({
	plugins: [stylexBabel(import.meta.dirname), react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.test.tsx"],
	},
})
