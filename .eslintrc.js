module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: [
        "plugin:import/typescript",
        "plugin:import/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "eslint:recommended", // Uses the recommended rules from @eslint-plugin-react
        "plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
        "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        "plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
        "plugin:typescript-sort-keys/recommended", // Sort interface/type and string enum keys
        "plugin:tailwindcss/recommended", // Tailwind CSS
    ],
    globals: {
        Cookies: "readonly",
        FrameRequestCallback: "readonly",
        JSX: "readonly",
        NodeJS: "readonly",
        Property: "readonly",
        Proxy: "readonly",
        React: "readonly",
        RequestInit: "readonly",
        TStrictOmit: "readonly",
        TStrictPick: "readonly",
    },
    ignorePatterns: [
        "./build/**.js",
        "./build/**.ts",
        "**/build/**.ts",
        "/dist/**",
        "out",
        "build",
        "node_modules",
    ],
    overrides: [
        {
            env: {
                jest: true,
            },
            extends: ["plugin:testing-library/react"],
            files: ["src"],
            globals: {
                $t: "readonly",
                $tc: "readonly",
            },
            rules: {
                "testing-library/no-node-access": "warn",
            },
        },
        {
            files: ["**/scripts/**/**.ts", "**/scripts/**/**.js"],
            rules: {
                "no-console": "off",
            },
        },
        {
            files: [
                "**/scripts/**/**.ts",
                "**/scripts/**/**.js",
                "**/__deprecated-tests__/**/**.ts",
                "**/__deprecated-tests__/**/**.tsx",
                "**/__test-utils__/**/**.ts",
                "**/__test-utils__/**/**.tsx",
                "**/*.*.test.ts",
            ],
            rules: {
                "import/no-extraneous-dependencies": [
                    "error",
                    {
                        devDependencies: true,
                        optionalDependencies: false,
                        peerDependencies: false,
                    },
                ],
            },
        },
    ],
    parser: "@typescript-eslint/parser",
    // Specifies the ESLint parser
    parserOptions: {
        // Allows for the use of imports
        ecmaFeatures: {
            jsx: true /* Allows for the parsing of JSX */,
        },
        ecmaVersion: 2020,
        // Allows for the parsing of modern ECMAScript features
        sourceType: "module",
        tsconfigRootDir: "./",
    },
    plugins: [
        "fp",
        "import",
        "no-relative-import-paths",
        "no-only-tests",
        "sort-destructure-keys",
        "sort-exports",
        "sort-keys-fix",
        "testing-library",
        "unicorn",
        "eslint-comments",
        "tailwindcss",
    ],
    rules: {
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/array-type": [
            "error",
            {
                default: "array",
            },
        ],
        "@typescript-eslint/ban-ts-comment": "error",
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                overrides: {
                    constructors: "no-public",
                },
            },
        ],
        "@typescript-eslint/lines-between-class-members": [
            "error",
            "always",
            {
                exceptAfterOverload: false,
                exceptAfterSingleLine: true,
            },
        ],
        "@typescript-eslint/member-ordering": [
            "error",
            {
                classes: {
                    memberTypes: [
                        "field",
                        "constructor",
                        "public-static-method",
                        "protected-static-method",
                        "private-static-method",
                        "public-method",
                        "protected-method",
                        "private-method",
                    ],
                    order: "alphabetically",
                },
            },
        ],
        "@typescript-eslint/naming-convention": [
            "error",
            {
                filter: {
                    match: true,
                    regex: "^(redact_*)$",
                },
                format: ["PascalCase", "camelCase", "UPPER_CASE"],
                leadingUnderscore: "allow",
                selector: "default",
            },
            {
                format: ["PascalCase"],
                leadingUnderscore: "allow",
                prefix: ["I", "T"],
                selector: "typeAlias",
            },
            {
                format: ["PascalCase", "camelCase", "UPPER_CASE"],
                leadingUnderscore: "allow",
                selector: "enum",
            },
        ],
        // Allow noops functions
        "@typescript-eslint/no-dynamic-delete": "error",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-extra-non-null-assertion": "error",
        "@typescript-eslint/no-extraneous-class": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/no-parameter-properties": "error",
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                args: "after-used",
                argsIgnorePattern: "^_",
                ignoreRestSiblings: true,
                varsIgnorePattern: "^_",
            },
        ],
        "@typescript-eslint/no-use-before-define": "error",
        "@typescript-eslint/no-useless-constructor": "error",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/prefer-as-const": "error",
        "@typescript-eslint/prefer-enum-initializers": "error",
        "@typescript-eslint/prefer-literal-enum-member": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/prefer-ts-expect-error": "error",
        "@typescript-eslint/sort-type-union-intersection-members": "error",
        "@typescript-eslint/triple-slash-reference": "error",
        "@typescript-eslint/unified-signatures": "error",
        "accessor-pairs": "error",
        "array-callback-return": "error",
        "block-scoped-var": "error",
        curly: ["error", "multi-line"],
        "default-case": "error",
        "default-case-last": "error",
        "dot-notation": "error",
        eqeqeq: "error",
        "eslint-comments/no-unused-disable": "error",
        "fp/no-mutating-assign": "error",
        "func-name-matching": "error",
        "func-names": "error",
        "guard-for-in": "error",
        // Ensures that named imports are always used
        "import/named": "error",
        "import/newline-after-import": "error",
        "import/no-default-export": "error",
        "import/no-deprecated": "warn",
        "import/no-extraneous-dependencies": [
            "error",
            {
                devDependencies: false,
                optionalDependencies: false,
                peerDependencies: false,
            },
        ],
        "import/no-internal-modules": "error",
        "import/order": [
            "error",
            {
                alphabetize: {
                    caseInsensitive: true,
                    order: "asc",
                },
                groups: [
                    "builtin",
                    "external",
                    "unknown",
                    "internal",
                    "parent",
                    "index",
                    "object",
                    "sibling",
                    "type",
                ],
                "newlines-between": "always",
            },
        ],
        "max-depth": [
            "error",
            {
                max: 4,
            },
        ],

        "no-cond-assign": "error",
        "no-constant-binary-expression": "error",
        "no-constant-condition": "error",
        "no-else-return": "error",
        "no-lonely-if": "error",
        "no-magic-numbers": ["off"],
        "no-negated-condition": "error",
        "no-nested-ternary": "error",
        "no-only-tests/no-only-tests": "error",
        "no-param-reassign": "error",
        "no-relative-import-paths/no-relative-import-paths": [
            "error",
            {
                allowSameFolder: true,
            },
        ],
        "no-return-assign": "error",
        "no-return-await": "error",
        "no-sequences": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef": "error",
        "no-undef-init": "error",
        "no-unneeded-ternary": "error",
        "no-unreachable": "error",
        "no-unused-expressions": "error",
        "no-useless-computed-key": "error",
        "no-useless-concat": "error",
        "no-useless-rename": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "object-shorthand": "error",
        "prefer-const": "error",
        "prefer-object-spread": "error",
        "prefer-rest-params": "error",
        "prefer-template": "error",
        "react/display-name": [
            "error",
            {
                ignoreTranspilerName: false,
            },
        ],
        "react/iframe-missing-sandbox": "warn",
        "react/jsx-curly-brace-presence": ["error", "never"],
        "react/jsx-fragments": "error",
        "react/jsx-key": [
            "error",
            {
                checkFragmentShorthand: true,
                checkKeyMustBeforeSpread: true,
                warnOnDuplicates: true,
            },
        ],
        "react/jsx-no-duplicate-props": "error",
        "react/jsx-no-leaked-render": [
            "error",
            {
                validStrategies: ["ternary"],
            },
        ],
        "react/jsx-no-script-url": "error",
        "react/jsx-no-target-blank": "error",
        "react/jsx-no-undef": "error",
        "react/jsx-no-useless-fragment": "error",
        "react/jsx-pascal-case": "error",
        "react/jsx-sort-props": [
            "error",
            {
                callbacksLast: true,
                reservedFirst: true,
                shorthandFirst: true,
            },
        ],
        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error",
        "react/no-access-state-in-setstate": "error",
        "react/no-arrow-function-lifecycle": "error",
        "react/no-danger-with-children": "error",
        "react/no-deprecated": "error",
        "react/no-did-mount-set-state": "error",
        "react/no-did-update-set-state": "error",
        "react/no-direct-mutation-state": "error",
        "react/no-find-dom-node": "error",
        "react/no-invalid-html-attribute": "error",
        "react/no-is-mounted": "error",
        "react/no-namespace": "error",
        "react/no-redundant-should-component-update": "error",
        "react/no-render-return-value": "error",
        "react/no-this-in-sfc": "error",
        "react/no-typos": "error",
        "react/no-unescaped-entities": "error",
        "react/no-unknown-property": [
            "error",
            {
                // See: https://github.com/vercel/next.js/discussions/40269
                ignore: ["jsx", "global"],
            },
        ],
        "react/no-unsafe": "warn",
        "react/no-unstable-nested-components": [
            "error",
            {
                allowAsProps: true,
            },
        ],
        "react/no-unused-class-component-methods": "error",
        "react/no-unused-state": "error",
        "react/no-will-update-set-state": "error",
        "react/prop-types": "error",
        // suppress errors for missing 'import React' in files
        "react/react-in-jsx-scope": "off",
        "react/require-render-return": "error",
        "react/self-closing-comp": "error",
        "react/sort-prop-types": [
            "error",
            {
                callbacksLast: true,
                ignoreCase: true,
                requiredFirst: true,
                sortShapeProp: true,
            },
        ],
        "react/style-prop-object": "error",
        "react/void-dom-elements-no-children": "error",
        "sort-destructure-keys/sort-destructure-keys": "error",
        "sort-exports/sort-exports": [
            "error",
            {
                ignoreCase: false,
                sortDir: "asc",
                sortExportKindFirst: "type",
            },
        ],
        "sort-imports": [
            "error",
            {
                allowSeparatedGroups: false,
                ignoreCase: false,
                ignoreDeclarationSort: true,
                // handled by import/order
                ignoreMemberSort: false,
                memberSyntaxSortOrder: ["all", "single", "multiple", "none"],
            },
        ],
        "sort-keys-fix/sort-keys-fix": "error",
        "spaced-comment": "error",
        strict: "error",
        "unicorn/numeric-separators-style": "error",
        "unicorn/prefer-at": "error",
        yoda: "error",
    },
    settings: {
        "import/resolver": {
            typescript: {
                project: "./",
            },
        },
        react: {
            version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
        },
    },
};
