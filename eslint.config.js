import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const project = path.resolve(__dirname, "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
const config = [
  {
    extends: ["next/core-web-vitals"],
    parserOptions: {
      project,
    },
    globals: {
      React: true,
      JSX: true,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project,
        },
      },
    },
    ignorePatterns: ["node_modules/", "dist/", ".next/"],
    rules: {
      "import/no-duplicates": "error",
    },
  },
];

export default config;
