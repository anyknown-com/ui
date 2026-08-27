import stylexBabelPlugin from "@stylexjs/babel-plugin"
import stylexPostcss from "@stylexjs/postcss-plugin"
import { fileURLToPath } from "node:url"

const uiRoot = fileURLToPath(new URL("..", import.meta.url))

export default {
	plugins: [
		stylexPostcss({
			cwd: uiRoot,
			include: ["dist/**/*.js", "playground/**/*.tsx"],
			useCSSLayers: false,
			babelConfig: {
				babelrc: false,
				configFile: false,
				parserOpts: { plugins: ["typescript", "jsx"] },
				plugins: [
					[
						stylexBabelPlugin,
						{
							dev: false,
							runtimeInjection: false,
							unstable_moduleResolution: { type: "commonJS", rootDir: uiRoot },
						},
					],
				],
			},
		}),
	],
}
