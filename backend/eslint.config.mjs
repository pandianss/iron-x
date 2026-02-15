import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        languageOptions: {
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
                ...globals.es2020,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
    {
        ignores: ['dist/', 'node_modules/', 'coverage/'],
    },
    {
        files: ['**/*.test.ts', 'src/tests/**/*.ts', 'tests/**/*.ts', 'src/scripts/**/*.js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'no-undef': 'off'
        }
    }
);
