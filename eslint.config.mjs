import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The estate-intake components (components/intake/steps.tsx, primitives.tsx)
  // are a faithful port of the approved external design (crain-wooley-intake ·
  // option-counsel-final.jsx). It defines small stateless presentational
  // sub-components inline per step and uses verbatim copy with apostrophes.
  // These two rules are stylistic and would force a structural rewrite that
  // diverges from the approved design, so they are scoped off here only.
  {
    files: ["components/intake/**/*.tsx"],
    rules: {
      "react-hooks/static-components": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
