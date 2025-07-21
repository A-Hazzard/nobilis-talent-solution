import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const project = path.resolve(__dirname, "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
const config = [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project,
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: true,
        JSX: true,
      },
    },
    rules: {
      // Unused variable rules - this is what you wanted!
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
          "ignoreRestSiblings": false
        }
      ],
      "no-unused-vars": "off", // Turn off base rule as it conflicts with TypeScript version
    },
  },
  {
    files: ["*.config.js", "*.config.mjs", "postcss.config.js", "tailwind.config.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // Basic rules for config files
      "no-unused-vars": "error",
    },
  },
  {
    ignores: [
      "node_modules/", 
      "dist/", 
      ".next/",
      "*.config.js",
      "postcss.config.js",
      "tailwind.config.js"
    ],
  },
];

export default config;
