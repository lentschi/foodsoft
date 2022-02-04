module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@ionic',
    '@angular-eslint',
    'rxjs',
  ],
  extends: ['plugin:@ionic/strict'],
  ignorePatterns: ["**/*.js"],
  rules: {
    'no-empty-function': [
      'error',
      {
        allow: ['constructors'],
      },
    ],
    'sort-imports': 'off',
    'line-comment-position': 'off',
    'capitalized-comments': 'off',
    'require-await': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',

    '@angular-eslint/no-conflicting-lifecycle': 'warn',

    '@angular-eslint/no-host-metadata-property': 'warn',

    '@angular-eslint/no-input-rename': 'warn',

    '@angular-eslint/no-inputs-metadata-property': 'warn',

    '@angular-eslint/no-output-native': 'warn',

    '@angular-eslint/no-output-on-prefix': 'warn',

    '@angular-eslint/no-output-rename': 'warn',

    '@angular-eslint/no-outputs-metadata-property': 'warn',

    '@angular-eslint/use-lifecycle-interface': 'warn',

    '@angular-eslint/use-pipe-transform-interface': 'warn',

    'rxjs/no-sharereplay': [
      'error',
      { allowConfig: true },
    ],
    'rxjs/no-unsafe-takeuntil': 'error'
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.e2e-spec.ts'],
      rules: {
        'no-undef': 'off',
      },
    },
    {
      files: ['*.e2e-spec.ts'],
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
  ],
};
