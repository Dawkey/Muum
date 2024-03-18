const {addWebpackPlugin, override} = require("customize-cra");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = override(
    addWebpackPlugin(new CopyPlugin({
        patterns: [
            {from: "src/assets/l2d", to: "./l2d"}
        ]
    }))
);