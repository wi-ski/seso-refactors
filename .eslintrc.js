module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: [
        "plugin:import/typescript",
        "plugin:import/recommended",
        "plugin:import/warnings",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        "plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
        "plugin:typescript-sort-keys/recommended", // Sort interface/type and string enum keys
    ],
    ignorePatterns: [
        "./build/**.js",
        "./build/**.ts",
        "**/build/**.ts",
        "/dist/**",
        "out",
        "build",
        "out",
        "dist",
        "**/*.d.ts",
        "node_modules",
    ],
    overrides: [
        {
            files: ["./src/**/*"],
            rules: {
                "import/no-unresolved": "off",
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
        "@typescript-eslint",
        "sort-destructure-keys",
        "sort-exports",
        "sort-keys-fix",
        "unicorn",
    ],
    rules: {
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/array-type": [
            "error",
            {
                default: "array",
            },
        ],
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
            "warn",
            {
                devDependencies: false,
                optionalDependencies: false,
                peerDependencies: false,
            },
        ],
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
        "no-param-reassign": "error",
        "no-return-assign": "error",
        "no-return-await": "error",
        "no-sequences": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef": "warn",
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
    },
}
