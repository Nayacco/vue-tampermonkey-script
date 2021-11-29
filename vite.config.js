import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    (() => {
      /**
       * 如果用到了额外的 GM_functions，需要添加对应 @grant
       * 虽然可以全部不添加，但只有TamperMonkey会自动推断，其他扩展不一定
       * 在上面 extenral 声明的库，此处需要添加对应的 @require 要注意全局变量名称
       */
      const headers = `\
// ==UserScript==
// @name         Your Script (prod mode)
// @namespace    https://your.site/
// @version      0.1.0
// @description  What does your script do
// @author       You
// @include      /https://match\.site/
// @grant        GM_addStyle
// @noframes
// @require      https://cdn.jsdelivr.net/npm/vue@3.2.6/dist/vue.global.min.js
// ==/UserScript==

`;

      return {
        name: "inject-css",
        apply: "build", // 仅在构建模式下启用
        enforce: "post", // 在最后处理
        generateBundle(options, bundle) {
          // 从 bundle 中提取 style.css 内容，并加入到脚本中
          const keyword = "user.js";
          if (!bundle["style.css"] || bundle["style.css"].type !== "asset")
            return;
          const css = bundle["style.css"].source;
          const [, target] =
            Object.entries(bundle).find(([name]) => {
              return name.includes(keyword);
            }) ?? [];
          if (!target || target.type !== "chunk") return;
          target.code = headers + `GM_addStyle(\`${css}\`)\n${target.code}`;
        },
      };
    })(),
  ],
  hmr: {
    protocol: "ws",
    host: "localhost",
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.js"),
      name: "userscript",
      formats: ["iife"], // 自运行打包格式，与默认模版一致
      fileName: (format) => `yourscript.${format}.user.js`, // 非函数的常量会自动添加后缀
    },
    rollupOptions: {
      external: ["vue"], // 分离库以降低最终代码体积
      output: {
        globals: {
          vue: "Vue",
          GM_addStyle: "GM_addStyle", // 油猴脚本API，用于添加样式到页面
        },
        inlineDynamicImports: true, // 库构建模式下不能进行代码分割，开启此功能可将本应分割的代码整合在一起避免报错（代码分割可能由其他插件引起）
      },
    },
    minify: "terser",
    terserOptions: {
      mangle: false, // 关闭名称混淆，遵守Greasefork规则
      format: {
        beautify: true, // 美化代码开启缩进，遵守Greasefork规则
      },
    },
  },
});
