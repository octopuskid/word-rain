// Shared production/lab policy. Global bindings are the Android/lab extension
// interface; retain them and all IDs/attribute quotes used by the packagers.
module.exports = () => ({
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeComments: true,
  removeRedundantAttributes: true,
  minifyCSS: { level: 1 },
  minifyJS: {
    compress: { passes: 3, unsafe: false, toplevel: false },
    mangle: { toplevel: false },
    format: { comments: false, ascii_only: false, inline_script: true }
  }
});
