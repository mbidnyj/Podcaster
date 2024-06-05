import pluginJs from "@eslint/js";
import globals from "globals";

export default [
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
    {
        languageOptions: {
            globals: { process: "writable", __dirname: "writable", ...globals.node },
        },
    },
    {
        ...pluginJs.configs.recommended,
        rules: {
            ...pluginJs.configs.recommended.rules,
            "no-unused-vars": ["off", { varsIgnorePattern: "process|__dirname" }],
        },
    },
];
