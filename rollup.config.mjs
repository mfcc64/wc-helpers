
import terser from "@rollup/plugin-terser";

const config = {
    input: "wc-helpers-main.mjs",
    output: {
        file: "wc-helpers-bundle.min.mjs",
        format: "es",
        sourcemap: true,
        sourcemapExcludeSources: true,
        plugins: [terser()]
    }
};

export default config;
