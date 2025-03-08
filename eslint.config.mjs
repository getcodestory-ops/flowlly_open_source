import globals from "globals";
import pluginJs from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import pluginReact from "eslint-plugin-react";

const config = {
	files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
	languageOptions: {
		parser: tsParser,
		globals: { ...globals.browser, ...globals.node }, // Include browser and Node.js globals
	},
	plugins: {
		"@typescript-eslint": tsPlugin,
		react: pluginReact,
	},
	//   overrides: [
	//     {
	//         files: ["*.tsx"],
	//         rules: {
	//             "@typescript-eslint/explicit-function-return-type": 0,
	//         },
	//     },
	// ],
	rules: {
		// ...pluginJs.configs.recommended.rules,
		// ...tsPlugin.configs.recommended.rules,
		...pluginReact.configs.recommended.rules,
		"@typescript-eslint/ban-ts-comment": "warn",
		"@typescript-eslint/no-explicit-any": ["warn"],
		"@typescript-eslint/explicit-function-return-type": [
			"warn",
			{
				allowExpressions: true,
				allowTypedFunctionExpressions: true,
				allowHigherOrderFunctions: true,
				allowDirectConstAssertionInArrowFunctions: true,
			},
		],
		"array-bracket-spacing": ["error", "never"],
		"max-len": ["warn", { code: 500, ignoreUrls: true }],
		"max-lines-per-function": ["warn", 300],
		"max-lines": ["warn", { max: 400, skipBlankLines: true, skipComments: true }],
		"no-unused-vars": [
			"warn",
			{
				vars: "all", // Check all variables
				args: "after-used", // Only warn for unused arguments after the last used one
				argsIgnorePattern: "^_", // Ignore arguments prefixed with "_"
				ignoreRestSiblings: true,
			},
		],
		"no-console": [
			"error",
			{
				allow: ["error", "warn"], // Allow console.error specifically
			},
		],
		"object-curly-spacing": ["error", "always"],
		"react/react-in-jsx-scope": "off",
		"space-before-function-paren": ["error", "never"],
		semi: ["error", "always"],
		quotes: ["error", "double"],
		// indent: ["error", 2],
		indent: ["error", "tab", { SwitchCase: 1 }],
		"quote-props": ["error", "as-needed"],
		"arrow-parens": ["error", "always"],
		"padded-blocks": ["error", "never"],
		"comma-spacing": ["error", { before: false, after: true }],
		"comma-dangle": ["error", { arrays: "always-multiline", objects: "always-multiline", imports: "only-multiline", exports: "only-multiline", functions: "always-multiline" }],
		"prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
		"newline-per-chained-call": ["error", { ignoreChainWithDepth: 2 }],
		// "react/jsx-wrap-multilines": ["error", { declaration: "parens-new-line", assignment: "parens-new-line", return: "parens-new-line", arrow: "parens-new-line", condition: "parens-new-line", logical: "parens-new-line", prop: "parens-new-line" }],
		"react/jsx-sort-props": ["warn", { noSortAlphabetically: false }],
		"react/jsx-max-props-per-line": ["error", { maximum: { single: 2, multi: 1 } }],
		// "react/jsx-first-prop-new-line": ["error", "multiline"],
		"react/jsx-closing-bracket-location": ["error", "tag-aligned"],
		"react/jsx-curly-spacing": ["error", "never"],
		"react/jsx-curly-brace-presence": ["error", { props: "never" }],
		"react/jsx-max-depth": ["error", { max: 12 }],
		"react/jsx-tag-spacing": ["error", { closingSlash: "never", beforeSelfClosing: "always", afterOpening: "never", beforeClosing: "never" }],
		"react/jsx-boolean-value": ["error", "never"],
		"react/jsx-newline": ["error", { prevent: true }],
		"react/jsx-pascal-case": "error",
		"react/jsx-props-no-multi-spaces": "error",
		"react/self-closing-comp": ["error", { component: true, html: true }],
	},
	settings: {
		react: {
			version: "detect",
		},
	},
};

export default [config];
