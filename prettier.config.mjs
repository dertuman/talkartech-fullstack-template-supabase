/** @type {import('prettier').Config} */
const config = {
  endOfLine: 'lf',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  importOrder: [
    '<BUILTIN_MODULES>',
    '^(react/(.*)$)|^(react$)',
    '^(next/(.*)$)|^(next$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/(.*)$',
    '',
    '^[./]',
  ],
  importOrderTypeScriptVersion: '5.0.0',
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  tailwindStylesheet: './src/styles/globals.css',
  tailwindFunctions: ['cn', 'cva'],
};

export default config;
