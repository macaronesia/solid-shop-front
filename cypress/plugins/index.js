module.exports = (on, config) => {
  if (config.testingType === 'component') {
    const { startDevServer } = require('@cypress/webpack-dev-server');
    const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
    const path = require('path');

    const basePath = path.join(__dirname, '../..');

    const webpackConfig = {
      output: {
        path: '/dist',
        filename: 'assets/js/bundle.[fullhash:8].js',
        publicPath: '/'
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            resolve: {
              extensions: ['.js', '.jsx']
            },
            include: [
              path.resolve(basePath, 'src'),
              path.resolve(basePath, 'cypress/component')
            ],
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: [
                    ['@babel/preset-env', { modules: false }],
                    '@babel/preset-react'
                  ],
                  plugins: [
                    ['@babel/plugin-transform-runtime', { helpers: false }]
                  ]
                }
              }
            ]
          },
          {
            test: /\.(woff|woff2|eot|ttf|png|svg)$/i,
            include: [
              path.resolve(basePath, 'node_modules')
            ],
            type: 'asset/inline'
          },
          {
            test: /\.(gif|png|jpe?g|svg)$/i,
            include: [
              path.resolve(basePath, 'src/assets/images')
            ],
            type: 'asset/resource',
            generator: {
              filename: 'assets/images/[name].[hash:8][ext]'
            },
            use: [
              {
                loader: ImageMinimizerPlugin.loader,
                options: {
                  minimizer: {
                    implementation: ImageMinimizerPlugin.imageminMinify,
                    options: {
                      plugins: [
                        ['gifsicle', {}],
                        ['jpegtran', {}],
                        ['optipng', {}]
                      ]
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      resolve: {
        alias: {
          '@': path.resolve(basePath, 'src/')
        }
      }
    };

    on('dev-server:start', (options) => startDevServer({ options, webpackConfig }));
  }
};
