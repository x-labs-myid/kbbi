const webpack = require("@nativescript/webpack");
const NativeScriptHTTPPlugin = require("@klippa/nativescript-http/webpack"); // Import NativeScriptHTTPPlugin

module.exports = (env) => {
  webpack.init(env);

  // Learn how to customize:
  // https://docs.nativescript.org/webpack

  webpack.chainWebpack((config) => {
    config.plugin("NativeScriptHTTPPlugin").use(NativeScriptHTTPPlugin);
  });

  return webpack.resolveConfig();
};
