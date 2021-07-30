const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	entry: './src/game.ts',
	mode: 'development',
	output: {
		filename: './game.js'
	},
	resolve: {
		extensions: [ '', '.webpack.js', '.web.js', '.ts', '.js' ]
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'ts-loader' },
			{
				test: [ /\.vert$/, /\.frag$/ ],
				use: 'raw-loader'
			},
			{
				test: /\.(gif|png|jpe?g|svg|xml)$/i,
				use: 'file-loader'
			}
		]
	},
	devtool: 'eval-source-map',
	plugins: [
		new CleanWebpackPlugin({
			root: path.resolve(__dirname, '../')
		}),
		new webpack.DefinePlugin({
			CANVAS_RENDERER: JSON.stringify(true),
			WEBGL_RENDERER: JSON.stringify(true)
		}),
		new HtmlWebpackPlugin({
			template: './index.html'
		})
	]
};
