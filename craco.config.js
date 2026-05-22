const path = require('path')

/**
 * react-scripts 4 does not transpile node_modules. WalletConnect v2 and its deps
 * (e.g. unstorage) use ?? and other syntax CRA 4 webpack cannot parse.
 */
const transpileNodeModuleRoots = ['@walletconnect', 'unstorage']

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const reactScriptsPath = path.dirname(require.resolve('react-scripts/package.json'))
      const babelLoader = require.resolve('babel-loader', { paths: [reactScriptsPath] })
      const presetEnv = require.resolve('@babel/preset-env', { paths: [reactScriptsPath] })

      const transpileIncludes = transpileNodeModuleRoots.map((pkg) =>
        path.resolve(__dirname, 'node_modules', pkg),
      )

      const walletConnectRule = {
        test: /\.m?js$/,
        include: transpileIncludes,
        loader: babelLoader,
        options: {
          babelrc: false,
          configFile: false,
          compact: false,
          cacheDirectory: true,
          cacheCompression: false,
          // Dev browserslist is "last 1 chrome" — preset-env would keep ?? / ?.
          // CRA 4 webpack cannot parse those in node_modules; force downlevel syntax.
          presets: [[presetEnv, { modules: false, targets: { ie: '11' } }]],
        },
      }

      const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf)
      if (oneOfRule) {
        oneOfRule.oneOf.unshift(walletConnectRule)
      }

      // unstorage: `import destr from 'destr'` — ESM default breaks under CRA/webpack 4
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        destr: path.resolve(__dirname, 'node_modules/destr/lib/index.cjs'),
      }

      return webpackConfig
    },
  },
}
