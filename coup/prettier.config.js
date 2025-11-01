/** @type {import("prettier").Config} */
const prettierConfig = {
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: "all",
  printWidth: 80,
  plugins: ["prettier-plugin-tailwindcss"], // Tailwind CSS 플러그인을 사용한다면 추가
};

export default prettierConfig;
