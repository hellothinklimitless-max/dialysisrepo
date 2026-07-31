import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Underscore-prefixed args are intentional placeholders (e.g. the
      // ranking selector's moduleId, unused until real cohort data exists).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      // Delivered as-is; not ours to reformat (see docs/00-README-START-HERE.md).
      "src/data/course-content.ts",
    ],
  },
];

export default config;
