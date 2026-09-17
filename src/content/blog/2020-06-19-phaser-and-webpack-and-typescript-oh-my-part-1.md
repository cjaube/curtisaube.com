---
title: "Phaser and Webpack and TypeScript, Oh My! - Part 1"
date: 2020-06-19
category: tech
tags: 
  - "node"
  - "npm"
  - "phaser"
  - "phaser3"
  - "typescript"
  - "webpack"
coverImage: /img/blog/abstract-art-blur-bright-417458.jpg
---

This will be a 3 part post. In the first part, we will look at setting up a simple Phaser 3 project. In the second part, we'll look at developing and building our project with Webpack. In the third part, we'll look at converting our JavaScript project to TypeScript and how we can better organize our project.

So tell me, what is Phaser anyway? Phaser is a lightweight and powerful JavaScript game framework for making 2D games that are playable right from your browser. Why are we using it? In part, I wanted to become familiar with Webpack and TypeScript and this is a fun way to do it, but also I'm intrigued by Phaser's lightweight framework and am excited to see what kind of games I can produce with it.

So first we need to pick a text editor or IDE to develop in. I'd recommend [Visual Studio Code](https://code.visualstudio.com/) because it's lightweight, free, and has good TypeScript support, which will come in handy in part 3 on this set of posts.

For this project, we'll start by using the code from this [breakout game](https://phaser.io/examples/v3/view/games/breakout/breakout#). Create a project directory and then grab the breakout game source [breakout.js](https://github.com/photonstorm/phaser3-examples/blob/master/public/src/games/breakout/breakout.js) and the assets [breakout.png](https://github.com/photonstorm/phaser3-examples/blob/master/public/assets/games/breakout/breakout.png) and [breakout.json](https://github.com/photonstorm/phaser3-examples/blob/master/public/assets/games/breakout/breakout.json). Then create an images directory and put the assets in there. Our directory structure should look like below.

```apacheconf
breakout
|- breakout.js
|- /images
  |- breakout.png
  |- breakout.json
```

Now we need to make a small tweak to our breakout.js file to make sure it's pointing at our asset files.

```javascript
    preload: function ()
    {
        this.load.atlas('assets', 'images/breakout.png', 'images/breakout.json');
    },
```

Now that we have that all setup, we just need to create an index.html file in our project directory that pulls in the phaser library and our new javascript file.

```markup
<!DOCTYPE html>
<html>
<head>
  <title>Breakout</title>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.15.1/dist/phaser-arcade-physics.min.js"></script>
</head>
<body>
  <div id="phaser-example"></div>
  <script src="breakout.js"></script>
</body>
</html>
```

We include the phaser library in in the head of the document and then we load our game script at the bottom. If we look in our breakout.js file, in the configuration at the bottom, we see that 'parent' is set to 'phaser-example', which refers to the div above.

Now to test our game, we just need to quickly setup a server. For this we will use [node.js](https://nodejs.org/en/download/) and the http-server package. If you havn't used node before, it is just a JavaScript runtime that allows us to run JavaScript outside of the browser. Once you have node installed, open a command prompt and type the following command:

```bash
> npm install --global http-server
```

NPM allows you to manage JavaScript packages for node. We'll use it again in the next part when we install Webpack. The --global means that we are installing it globally and not for just for a single project. Now cd to your project directory and start the server.

```bash
> http-server
```

It will display the url that your server is being hosted at and hang there. That's fine. If you want to stop the server later, just hit Ctrl+c. Open a browser and navigate to http://127.0.0.1:8080. You should now see the example breakout game running. Congrats!

So far we've setup a basic Phaser 3 project from an example. You could totally start making a game from here if you'd like, but if you stay with us for the next part, you'll see how using Webpack and really help streamline your development process.

Thanks for reading! Check out the full [source](https://github.com/cjaube/phasertemplates/tree/master/breakout_part1). Comment and like below!
