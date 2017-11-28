var webpack = require('webpack')
var merge = require('webpack-merge')
var baseConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ZipPlugin = require('webpack-zip-files-plugin')
var packAge = require('../package.json');
var path = require('path');
var nameResult = null;

// whether to generate source map for production files.
// disabling this can speed up the build.
// 代码是否生成.map文件
var SOURCE_MAP = false

//装换成驼峰命名加时间戳
var nameControl = function(name) {
  if (name.indexOf('-') === 0 || name.substring(name.length - 1) === '-') {
    var msg = '项目命名不规范, 请将 package.json中的' +
      'name字段值以 "-" 将语义化的字段隔开代替驼峰式命名,' +
      '如"Apple-Watch-Color" \n ' +
      '因为项目命名不规范，本次构建将不会生成zip格式';
    console.log(msg);
    return false;
  }
  var nameArray = name.split('-');
  var nameString = '';
  for (var i = 0, len = nameArray.length; i < len; i++) {
    if (!!nameArray[i] && typeof nameArray[i] === 'string') {
      var first = (i === 0 ? nameArray[i].substring(0, 1).toLowerCase() : nameArray[i].substring(0, 1).toUpperCase());
      var remain = nameArray[i].substring(1, nameArray[i].length).toLowerCase();
      var item = first + remain;
      nameString = nameString + item;
    }
  }
  return nameString;
};

var getDateTime = function() {
  var d = new Date(),
    year = d.getFullYear() + '',
    month = d.getMonth() >= 9 ? (d.getMonth() + 1) + '' : '0' + (d.getMonth() + 1),
    day = d.getDate() > 9 ? d.getDate() + '' : '0' + d.getDate(),
    hours = d.getHours() > 9 ? d.getHours() + '' : '0' + d.getHours(),
    mins = d.getMinutes() > 9 ? d.getMinutes() + '' : '0' + d.getMinutes();
  return year + month + day + '_' + hours + mins;
};

nameResult = nameControl(packAge.name);

var Empty = function() {};
Empty.prototype.apply = function() {};

module.exports = merge(baseConfig, {
  devtool: SOURCE_MAP ? '#source-map' : false,
  output: {
    // naming output files with hashes for better caching.
    // dist/index.html will be auto-generated with correct URLs.
    // filename: '[name].[chunkhash].js',
    filename: '[name].[chunkhash].js',
    chunkFilename: '[id].[chunkhash].js'
  },
  externals: {
    //   未来直接引入 http lib
    //  'react': 'React'
  },
  plugins: [
    // Files Chunk
    new webpack.optimize.CommonsChunkPlugin({
      names: ["vendor"],
      filename: 'vendor.js'
    }),
    // http://vuejs.github.io/vue-loader/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    // extract css into its own file
    new ExtractTextPlugin('[name].[contenthash].css'),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: '../index.html',
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      }
    }),
    !!nameResult ? new ZipPlugin({
      entries: [
        {src: path.join(__dirname, '../dist'), dist: './'},
      ],
      output: path.join(__dirname, '../zip/' + nameResult + '_' + getDateTime()),
      format: 'zip',
    }) : new Empty()
  ]
})
