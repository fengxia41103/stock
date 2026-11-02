// ESLint 9 flat config.
//
// Migrated from the legacy .eslintrc.json. The old config extended "airbnb",
// "prettier", and used eslint-plugin-import / eslint-plugin-simple-import-sort,
// none of which are installed — so those rules were already inert. This config
// is built on what is actually present (@eslint/js, eslint-plugin-react,
// eslint-plugin-react-hooks, globals) and preserves the rule intents that do
// not depend on the missing plugins.

import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";

export default [
  // Ignored paths (replaces .eslintignore).
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      "**/*.min.js",
    ],
  },

  // Base recommended JS rules.
  js.configs.recommended,

  // Application source.
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // React recommended + hooks.
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // New JSX transform: React import not required in scope.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/require-default-props": "off",
      "react/jsx-props-no-spreading": "off",
      "react/jsx-one-expression-per-line": "off",
      "react/jsx-curly-newline": "off",

      // Preserved intents from the legacy config.
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-filename-extension": [
        "error",
        { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      ],
      "arrow-parens": ["warn", "always"],
      camelcase: "off",
      "consistent-return": "off",
      "no-nested-ternary": "off",
      "no-param-reassign": "off",
      "no-use-before-define": "off",
      "no-unused-vars": ["error", { args: "none" }],
      "no-console": ["error", { allow: ["warn", "error", "debug"] }],
    },
  },

  // TypeScript sources: use the TS parser so generics/type annotations parse.
  // We keep the same (JS) rule set rather than adopting the full typescript-
  // eslint ruleset — the goal is to lint TS files, not to add new TS rules.
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
