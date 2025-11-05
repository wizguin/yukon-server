import { defineConfig, globalIgnores } from 'eslint/config'
import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

export default defineConfig(
    globalIgnores([
        'dist'
    ]),
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        plugins: {
            '@stylistic': stylistic
        },

        rules: {
            'arrow-body-style': ['error', 'as-needed'],
            camelcase: [
                'error',
                {
                    properties: 'never'
                }
            ],
            curly: 'error',
            'dot-notation': 'error',
            eqeqeq: [
                'error',
                'always',
                {
                    null: 'ignore'
                }
            ],
            'no-return-await': 'error',
            'object-shorthand': 'error',
            'sort-imports': [
                'error',
                {
                    allowSeparatedGroups: true,
                    ignoreCase: true
                }
            ],

            '@stylistic/array-bracket-spacing': 'error',
            '@stylistic/arrow-parens': [
                'error',
                'as-needed'
            ],
            '@stylistic/arrow-spacing': 'error',
            '@stylistic/block-spacing': 'error',
            '@stylistic/brace-style': 'error',
            '@stylistic/comma-dangle': 'error',
            '@stylistic/comma-spacing': 'error',
            '@stylistic/comma-style': 'error',
            '@stylistic/eol-last': 'error',
            '@stylistic/indent': [
                'error',
                4,
                {
                    SwitchCase: 1
                }
            ],
            '@stylistic/key-spacing': 'error',
            '@stylistic/keyword-spacing': 'error',
            '@stylistic/linebreak-style': 'error',
            '@stylistic/lines-between-class-members': [
                'error',
                'always',
                {
                    exceptAfterSingleLine: true
                }
            ],
            '@stylistic/member-delimiter-style': [
                'error',
                {
                    multiline: {
                        delimiter: 'none'
                    },
                    singleline: {
                        delimiter: 'comma'
                    }
                }
            ],
            '@stylistic/no-extra-parens': 'error',
            '@stylistic/no-multiple-empty-lines': [
                'error',
                {
                    max: 1
                }
            ],
            '@stylistic/no-multi-spaces': 'error',
            '@stylistic/no-tabs': 'error',
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/no-whitespace-before-property': 'error',
            '@stylistic/nonblock-statement-body-position': 'error',
            '@stylistic/object-curly-spacing': [
                'error',
                'always'
            ],
            '@stylistic/padded-blocks': [
                'error',
                {
                    classes: 'always'
                }
            ],
            '@stylistic/quotes': [
                'error',
                'single'
            ],
            '@stylistic/quote-props': [
                'error',
                'as-needed'
            ],
            '@stylistic/semi': [
                'error',
                'never'
            ],
            '@stylistic/space-before-blocks': 'error',
            '@stylistic/space-before-function-paren': [
                'error',
                {
                    anonymous: 'never',
                    named: 'never',
                    asyncArrow: 'always'
                }
            ],
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/type-annotation-spacing': 'error',

            '@typescript-eslint/ban-ts-comment': 'off', // temp
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    ignoreRestSiblings: true
                }
            ]
        }
    }
)
