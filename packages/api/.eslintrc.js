// add rule overrides sparingly with clear necessity
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['../../.eslintrc.js'],
  ignorePatterns: ['app/public/client/dist/*', 'tasks/*', 'src/migrations/*', 'src/controllers/scim.mjs'],
};
