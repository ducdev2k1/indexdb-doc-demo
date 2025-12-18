import vue from "@vitejs/plugin-vue";
import Prism from "markdown-it-prism";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Markdown from "unplugin-vue-markdown/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      wrapperClasses:
        "prose prose-lg dark:prose-invert max-w-4xl mx-auto py-8 px-6",
      markdownItUses: [Prism],
      markdownItSetup(md) {
        const defaultFence =
          md.renderer.rules.fence ||
          function (tokens, idx, options, _env, self) {
            return self.renderToken(tokens, idx, options);
          };
        md.renderer.rules.fence = function (tokens, idx, options, env, self) {
          const code = defaultFence(tokens, idx, options, env, self);
          return `<CodeBlock>${code}</CodeBlock>`;
        };
      },
    }),
    AutoImport({
      imports: ["vue", "vue-router"],
      dts: "src/auto-imports.d.ts",
    }),
    Components({
      extensions: ["vue", "md"],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: "src/components.d.ts",
    }),
  ],
});
