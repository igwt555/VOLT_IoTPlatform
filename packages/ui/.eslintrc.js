module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  parser: 'vue-eslint-parser',
  extends: ['../../.eslintrc.js', 'plugin:vue/vue3-recommended'],
  rules: {
    'vue/no-reserved-component-names': 1,
    'vue/multi-word-component-names': 0,
    'vue/attribute-hyphenation': ['error', 'always', {
      ignore: ['optionLabel', 'activatorText'],
    }],
    'vue/html-closing-bracket-newline': 0,
    'vue/max-attributes-per-line': 0,
    'vue/singleline-html-element-content-newline': 0,
    'import/prefer-default-export': 0,
  },
};
