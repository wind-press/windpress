import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import oxlint from 'eslint-plugin-oxlint';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // add more generic rulesets here, such as:
    // js.configs.recommended,
    tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    // {
    //     rules: {
    //         // override/add rules settings here, such as:
    //         // 'vue/no-unused-vars': 'error'
    //     },
    //     languageOptions: {
    //         sourceType: 'module',
    //         globals: {
    //             ...globals.browser
    //         }
    //     }
    // },
    ...oxlint.configs['flat/recommended'], // oxlint should be the last one
)