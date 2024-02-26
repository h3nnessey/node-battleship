import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  target: 'node',
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
        extensions: ['.ts', '.js', '.json'],
      }),
    ],
    extensions: ['.ts', '.js', '.json'],
  },
  output: {
    filename: 'index.js',
    path: resolve(__dirname, './dist'),
    clean: true,
  },
};
