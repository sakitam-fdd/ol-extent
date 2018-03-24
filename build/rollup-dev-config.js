const { input, output } = require('./rollup-base-config')[0]
const {cssPlugins} = require('./helper');

input.plugins.splice(2, 0, cssPlugins);
module.exports = Object.assign({
  plugins: []
}, input, {output});
