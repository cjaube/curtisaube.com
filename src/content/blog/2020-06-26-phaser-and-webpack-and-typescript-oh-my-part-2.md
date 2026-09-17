---
title: "Phaser and Webpack and TypeScript, Oh My! - Part 2"
date: 2020-06-26
categories: 
  - "game-development"
  - "web-development"
tags: 
  - "node"
  - "npm"
  - "phaser"
  - "phaser3"
  - "typescript"
  - "webpack"
coverImage: "crop-man-taping-carrying-box-with-scotch-4246120.jpg"
---

If you're just getting here, make sure to check out [part 1](https://curtisaube.com/wp-admin/post.php?post=107) where we setup our Phaser 3 project. In this part we will be adding Webpack. You may have noticed in the last part, we pulled the Phaser source from a CDN. This is okay, but when we go to publish our game, we'll probably want all the source bundled together. This is where where webpack comes in. Now of course, there are many options out there for minifying, transpiling and bundling your code, but Webpack does all this and more, as we'll see in a bit, with some pretty straightforward configuration.

We last left our project with files as so.

```apacheconf
breakout
|- /images
  |- breakout.png
  |- breakout.json
|- breakout.js
|- index.html
```

Before we install Webpack, we need to setup our project with NPM. We've said before that NPM can manage packages, but this time we want NPM to manage packages for our specific project. Open a command prompt, cd to the project directory and type the following:

```bash
> npm init
```

This will ask you some questions about your project and then generate a new package.json file. You can accept the defaults if you'd like. What this file does for us is, as we add new packages we can tell them to be added to this file so if we decide to collaborate on this project in the future, all someone has to do to get all the packages is type 'npm install'.

Now let's add Phaser and Webpack and save them to our project's packages.

```bash
> npm install --save phaser@3.23.0
> npm install --save-dev webpack webpack-cli
```

Notice that we used save-dev for Webpack. This is because it is a dependency for development, not the published code. The distinction doesn't matter too much as we are not planning on publishing this NPM project as a package, but it's good to keep things clean.

Our project now looks like this:

```apacheconf
breakout
|- /images
  |- breakout.png
  |- breakout.json
|- /node_modules
|- breakout.js
|- index.html
|- package.json
|- package-lock.json
```

You'll notice there's also a package-lock.json and a node\_modules directory file now. The package-lock.json just keeps more information about the specific packages you've installed and the node\_modules directory contains the actual packages.

Now let's rearrange our project a bit to work better with Webpack. Create a dist directory and a src directory. Then move your images directory, your breakout.js and your index.html file in to your src directory. Our new structure looks like this:

```apacheconf
breakout
|- /dist
|- /node_modules
|- /src
  |- /images
    |- breakout.png
    |- breakout.json
  |- breakout.js
  |- index.html
|- package.json
|- package-lock.json
```

With Webpack, the goal is to create a configuration that will package our files up and move them in to the dist directory. Create the file webpack.config.js and fill it in as below.

```javascript
const path = require('path');

module.exports = {
  entry: {
    app: './src/breakout.js',
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devtool: 'inline-source-map',
};
```

The above will start with breakout.js and build a file called bundle.js in the dist directory. Let's give it a shot.

```bash
> npx webpack --config webpack.config.js
```

Now if we check in the dist directory, we'll see our new bundle, but if we open it, we'll see that it only contains the source from breakout.js. We need it to contain the Phaser source as well. The way we tell Webpack what the dependencies are is by adding import statements to our js code. Let's add the following code to the top of our breakout.js file.

```javascript
import 'phaser'
```

Now when we run Webpack, we see additional code in our bundle to load the rest of the source. When we setup a production build, it will include all the source minified together.

So this is good, but it only contains our one js bundle. We need it to also include our assets and our index file. To do that, we need a Webpack plugin. Let's get a plugin to clean the dist directory between builds while we're at it.

```bash
> npm install --save-dev copy-webpack-plugin 
> npm install --save-dev clean-webpack-plugin
```

Now lets add the following to the top of the Webpack config:

```javascript
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
```

Then add the following to the module.exports:

```javascript
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyPlugin({
      patterns: [
        { from: 'index.html', context: 'src/' },
        { from: 'images/*', context: 'src/' },
      ],
    }),
  ],
```

This will copy the index.html and the contents of the images directory to the dist folder while maintaining the directory structure. The context tells it what the base directory is. This way the src directory itself won't get copied.

Now when we build Webpack, all the other files are found in the dist directory. Now that the build is working, we need to update our index.html file to point at the right JavaScript file and no longer use the Phaser CDN.

```markup
<!DOCTYPE html>
<html>
<head>
  <title>Breakout</title>
  <meta charset="utf-8">
</head>
<body>
  <div id="phaser-example"></div>
  <script src="bundle.js"></script>
</body>
</html>
```

We can now test our work, and there is another plugin just for that!

```bash
> npm install --save-dev webpack-dev-server
```

To turn this one all we need to do, is add the following to the module.exports:

```javascript
  devServer: {
    contentBase: './dist',
  },
```

Now to start our server:

```bash
> npx webpack-dev-server --open --config webpack.config.js
```

It automatically opens the browser and displays the game. The great thing about this server is that it supports live updates, so when you make a change to your code, it automatically updates in the browser!

Okay, one last change. Let's split the config in to development and production configs. To do that we'll use another plugin!

```bash
> npm install --save-dev webpack-merge
```

Now we split our config in to webpack.common.js,

```javascript
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/breakout.js',
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyPlugin({
      patterns: [
        { from: 'index.html', context: 'src/' },
        { from: 'images/*', context: 'src/' },
      ],
    }),
  ],
};
```

webpack.dev.js,

```javascript
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
  },
});
```

and webpack.prod.js.

```javascript
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
});
```

Finally, we can update the package.json scripts so that we have easy access to starting the development server and making production builds.

```json
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "webpack-dev-server --open --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js"
  },
```

Now when we run,

```bash
> npm start
```

it starts the development server and when we run,

```bash
> npm run build
```

it builds for production. The production files get placed in the dist folder. Our build is now a grand total of 1.14 MB. Not bad!

Now you have a fully functioning build pipeline and a fast development cycle for your project! If are are interested in working with TypeScript, stay with us for the next and final part of this post series.

Thanks for reading! Check out the full [source](https://github.com/cjaube/phasertemplates/tree/master/breakout_part2). Be sure to comment and like below!
