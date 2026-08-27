import { transformAsync } from "@babel/core"
import type { Plugin } from "vite"

export function stylexBabel(rootDir: string): Plugin {
	return {
		name: "anyknown-stylex-babel",
		enforce: "pre",
		async transform(code, id) {
			if (!/\.[jt]sx?$/.test(id) || id.includes("node_modules")) return null
			if (!code.includes("@stylexjs/stylex")) return null
			const out = await transformAsync(code, {
				filename: id,
				babelrc: false,
				configFile: false,
				parserOpts: { plugins: ["typescript", "jsx"] },
				plugins: [
					[
						"@stylexjs/babel-plugin",
						{
							dev: true,
							runtimeInjection: true,
							unstable_moduleResolution: { type: "commonJS", rootDir },
						},
					],
				],
			})
			return out?.code ? { code: out.code, map: out.map as never } : null
		},
	}
}
