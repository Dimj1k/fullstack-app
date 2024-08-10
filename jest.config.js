function makeModuleNameMapper(srcPath, tsconfigPath) {
    // Get paths from tsconfig
    const { paths } = require(tsconfigPath).compilerOptions;

    const aliases = {};

    // Iterate over paths and convert them into moduleNameMapper format
    Object.keys(paths).forEach((item) => {
        const key = item.replace('/*', '/(.*)');
        const path = paths[item][0].replace('/*', '/$1');
        aliases[key] = srcPath + '/' + path;
    });
    return aliases;
}

const TS_CONFIG_PATH = './tsconfig.json';
const SRC_PATH = '<rootDir>';

module.exports = {
    'roots': [
        SRC_PATH,
        'apps/mailer'
    ],
    "rootDir": ".",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
        "**/*.ts"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "modulePaths": [
        "<rootDir>",
    ],
    "moduleDirectories": [
        "node_modules"
    ],
    // 'moduleNameMapper': {...makeModuleNameMapper(SRC_PATH, TS_CONFIG_PATH), "src/(.*)": "<rootDir>/$1" },
    "moduleFileExtensions": [
        "js",
        "json",
        "ts"
    ],
};