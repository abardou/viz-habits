module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/recommended',
    'eslint:recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'indent': [
      'error',
      'tab'
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'no-console': 'off',
    'no-unused-vars': 'off',
    'vue/html-indent': ['error', 'tab'],
    'vue/max-attributes-per-line': ['error', { 'singleline': 3 }],
    'vue/no-unused-components': 'warn'
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2019,
  }
}
