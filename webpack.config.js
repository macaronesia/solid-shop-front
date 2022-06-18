const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const path = require('path');
const { DefinePlugin } = require('webpack');

const devMode = process.env.NODE_ENV !== 'production';
const env = require('./env');

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/bundle.[fullhash:8].js',
    publicPath: '/'
  },
  plugins: [
    new DefinePlugin({ 'window.env': JSON.stringify(env) }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, 'src/index.html')
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        resolve: {
          extensions: ['.js', '.jsx']
        },
        include: [
          path.resolve(__dirname, 'src')
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { modules: false }],
                '@babel/preset-react'
              ],
              plugins: ['@babel/plugin-transform-runtime']
            }
          }
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        include: [
          path.resolve(__dirname, 'src/assets/images')
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
      },
      {
        test: /\.(hdr)$/i,
        include: [
          path.resolve(__dirname, 'src/assets/textures')
        ],
        type: 'asset/resource',
        generator: {
          filename: 'assets/textures/[name].[hash:8][ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/')
    }
  },
  ...(devMode ? {
    devtool: 'eval-source-map',
    devServer: {
      hot: true
    }
  } : {})
};
