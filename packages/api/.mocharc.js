'use strict';

module.exports = {
    recursive:true,
    diff: true,
    extension: ['mjs'],
    package: './package.json',
    reporter: 'landing',
    slow: 75,
    timeout: 2000,
    ui: 'bdd',
    'watch-files': ['src/test/*.mjs', 'src/test/**/*.mjs'],
};