import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// フラット構成のESLint設定
const eslintConfig = [
  // 既存の設定を保持
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // 追加の推奨設定
  ...compat.extends("eslint:recommended"),
  
  // Prettier連携（オプション）
  ...compat.extends("plugin:prettier/recommended"),
  
  // ルール設定
  {
    rules: {
      // インデントルールを設定（タブサイズを2に設定）
      "indent": ["error", 2],
      
      // セミコロン、クォーテーションなどのスタイルルール
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      
      // 追加のフォーマットルール
      "no-multiple-empty-lines": ["error", { "max": 1 }],
      "no-trailing-spaces": "error",
      "comma-dangle": ["error", "always-multiline"],
    },
  },
];

export default eslintConfig;