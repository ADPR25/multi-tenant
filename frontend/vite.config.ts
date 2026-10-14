import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueDevTools from "vite-plugin-vue-devtools";
import vuetify from "vite-plugin-vuetify";
import checker from "vite-plugin-checker";
import fs from "node:fs";
import path from "node:path";
import JavaScriptObfuscator from "javascript-obfuscator";
import CleanCSS from "clean-css";

function canvasformProtectPlugin() {
  return {
    name: "canvasform-protect",
    closeBundle() {
      const baseDist = path.resolve("dist/canvasform");
      if (!fs.existsSync(baseDist)) return;
      const jsDir = path.join(baseDist, "js");
      const cssDir = path.join(baseDist, "css");
      
      try { 
        fs.unlinkSync(path.join(baseDist, "LICENSE")); 
      } catch {
        // archivo no existe, ignorar
      }

      if (fs.existsSync(cssDir)) {
        const cleaner = new CleanCSS({ 
          level: 2,
          format: 'keep-breaks' 
        });
        for (const file of fs.readdirSync(cssDir)) {
          if (!file.endsWith(".css")) continue;
          const fullPath = path.join(cssDir, file);
          const code = fs.readFileSync(fullPath, "utf-8");
          const minified = cleaner.minify(code).styles;
          fs.writeFileSync(fullPath, minified.replace(/\n/g, ""), "utf-8");
          console.log(`[canvasform-protect] CSS minificado: ${file}`);
        }
      }

      if (fs.existsSync(jsDir)) {
        for (const file of fs.readdirSync(jsDir)) {
          if (!file.endsWith(".js")) continue;
          const fullPath = path.join(jsDir, file);
          const code = fs.readFileSync(fullPath, "utf-8");
          const obfuscated = JavaScriptObfuscator.obfuscate(code, {
            compact: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: "hexadecimal",
            stringArray: true,
            stringArrayEncoding: ["rc4"],
            stringArrayThreshold: 0.75,
            selfDefending: false,
            unicodeEscapeSequence: true,
          }).getObfuscatedCode();
          fs.writeFileSync(fullPath, obfuscated, "utf-8");
          console.log(`[canvasform-protect] JS ofuscado: ${file}`);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    vuetify({ autoImport: true }),
    checker({
      typescript: true,
      eslint: {
        lintCommand: "eslint . --cache",
        useFlatConfig: true,
      },
    }),
    canvasformProtectPlugin(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: { sourcemap: false },
});