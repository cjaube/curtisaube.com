---
title: "Phaser and Webpack and TypeScript, Oh My! – Part 3"
date: 2020-07-03
category: tech
tags: 
  - "game-development"
  - "phaser"
  - "typescript"
coverImage: /img/blog/seattle_washington_state_skyline.jpg
---

In this last part of my 3-part post, we'll be talking about converting our project to TypeScript. If you are just joining, but sure to check out the [previous posts](https://curtisaube.com/?p=107).

First of all, why would we want to use TypeScript? Well, as the name would suggest, it makes use of types for Javaacript. Normally we try not to worry about types too much in JavaScript, but behind the scenes, Javascript is inferring the type and when types don't match in an expression, Javascript uses type coercion to force them to match, sometimes leading to unexpected results. TypeScript takes out the guessing and in doing so can provide better IDE features like code completion. Let's get started!

So far we've setup a Phaser project with WebPack and now our project looks like this:

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
|- webpack.common.js
|- webpack.dev.js,
|- webpack.prod.js
```

First we need to setup TypeScript so lets start by adding it to our npm package.

```bash
> npm install --save-dev typescript
```

Now let's change all our .js files to .ts. Then we'll need to add a TypeScript config file called tsconfig.json.

```json
{
    "compilerOptions": {
        "typeRoots": [
            "./node_modules/phaser/types"
        ],
        "types": [
            "Phaser"
        ]
    }
}
```

This tells TypeScript that we are using Phaser type libraries which will give us better code completion support while developing our Phaser project.

Now we need to tell WebPack how to compile these files. First we need another library.

```bash
> npm install --save-dev ts-loader
```

Now let's update the common WebPack config.

```javascript
  entry: {
    app: './src/breakout.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ]
  },
```

We've changed the main file's extension and added support for .ts and .tsx files. Now we can open up our breakout.ts file in Visual Studio Code and see what happens!

Right off the bat, we should see an error like, "Property 'Class' does not exist on type 'typeof Phaser'." Now that we are using TypeScript, we can take advantage of ES6 classes, so rather than trying to resolve this error, let's just start using classes. Once we fix that, we'll start getting more errors related to types, and we can just add in the types as we go. Check out the side by side.

```javascript
import 'phaser'

var Breakout = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Breakout ()
    {
        Phaser.Scene.call(this, { key: 'breakout' });

        this.bricks;
        this.paddle;
        this.ball;
    },

    preload: function ()
    {
        this.load.atlas('assets', 'images/breakout.png', 'images/breakout.json');
    },

    create: function ()
    {
        //  Enable world bounds, but disable the floor
        this.physics.world.setBoundsCollision(true, true, true, false);

        //  Create the bricks in a 10x6 grid
        this.bricks = this.physics.add.staticGroup({
            key: 'assets', frame: [ 'blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1' ],
            frameQuantity: 10,
            gridAlign: { width: 10, height: 6, cellWidth: 64, cellHeight: 32, x: 112, y: 100 }
        });

        this.ball = this.physics.add.image(400, 500, 'assets', 'ball1').setCollideWorldBounds(true).setBounce(1);
        this.ball.setData('onPaddle', true);

        this.paddle = this.physics.add.image(400, 550, 'assets', 'paddle1').setImmovable();

        //  Our colliders
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        //  Input events
        this.input.on('pointermove', function (pointer) {

            //  Keep the paddle within the game
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

            if (this.ball.getData('onPaddle'))
            {
                this.ball.x = this.paddle.x;
            }

        }, this);

        this.input.on('pointerup', function (pointer) {

            if (this.ball.getData('onPaddle'))
            {
                this.ball.setVelocity(-75, -300);
                this.ball.setData('onPaddle', false);
            }

        }, this);
    },

    hitBrick: function (ball, brick)
    {
        brick.disableBody(true, true);

        if (this.bricks.countActive() === 0)
        {
            this.resetLevel();
        }
    },

    resetBall: function ()
    {
        this.ball.setVelocity(0);
        this.ball.setPosition(this.paddle.x, 500);
        this.ball.setData('onPaddle', true);
    },

    resetLevel: function ()
    {
        this.resetBall();

        this.bricks.children.each(function (brick) {

            brick.enableBody(false, 0, 0, true, true);

        });
    },

    hitPaddle: function (ball, paddle)
    {
        var diff = 0;

        if (ball.x < paddle.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        }
        else if (ball.x > paddle.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = ball.x -paddle.x;
            ball.setVelocityX(10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ball.setVelocityX(2 + Math.random() * 8);
        }
    },

    update: function ()
    {
        if (this.ball.y > 600)
        {
            this.resetBall();
        }
    }

});

var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    scene: [ Breakout ],
    physics: {
        default: 'arcade'
    }
};

var game = new Phaser.Game(config);
```

```typescript
import 'phaser'

class Breakout extends Phaser.Scene
{
    bricks: Phaser.Physics.Arcade.StaticGroup;
    paddle: Phaser.Physics.Arcade.Image;
    ball: Phaser.Physics.Arcade.Image;
    
    constructor(config: Phaser.Types.Core.GameConfig)
    {
        super(config);
    }

    preload()
    {
        this.load.atlas('assets', 'images/breakout.png', 'images/breakout.json');
    }

    create()
    {
        //  Enable world bounds, but disable the floor
        this.physics.world.setBoundsCollision(true, true, true, false);

        //  Create the bricks in a 10x6 grid
        this.bricks = this.physics.add.staticGroup({
            key: 'assets', frame: [ 'blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1' ],
            frameQuantity: 10,
            gridAlign: { width: 10, height: 6, cellWidth: 64, cellHeight: 32, x: 112, y: 100 }
        });

        this.ball = this.physics.add.image(400, 500, 'assets', 'ball1').setCollideWorldBounds(true).setBounce(1);
        this.ball.setData('onPaddle', true);

        this.paddle = this.physics.add.image(400, 550, 'assets', 'paddle1').setImmovable();

        //  Our colliders
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        //  Input events
        this.input.on('pointermove', function (pointer) {

            //  Keep the paddle within the game
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

            if (this.ball.getData('onPaddle'))
            {
                this.ball.x = this.paddle.x;
            }

        }, this);

        this.input.on('pointerup', function (pointer) {

            if (this.ball.getData('onPaddle'))
            {
                this.ball.setVelocity(-75, -300);
                this.ball.setData('onPaddle', false);
            }

        }, this);
    }

    hitBrick(ball: Phaser.Physics.Arcade.Image, brick: Phaser.Physics.Arcade.Image)
    {
        brick.disableBody(true, true);

        if (this.bricks.countActive() === 0)
        {
            this.resetLevel();
        }
    }

    resetBall()
    {
        this.ball.setVelocity(0);
        this.ball.setPosition(this.paddle.x, 500);
        this.ball.setData('onPaddle', true);
    }

    resetLevel()
    {
        this.resetBall();

        this.bricks.children.each(function (brick: Phaser.Physics.Arcade.Image) {

            brick.enableBody(false, 0, 0, true, true);

        });
    }

    hitPaddle(ball: Phaser.Physics.Arcade.Image, paddle: Phaser.Physics.Arcade.Image)
    {
        var diff = 0;

        if (ball.x < paddle.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        }
        else if (ball.x > paddle.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = ball.x -paddle.x;
            ball.setVelocityX(10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }

    update()
    {
        if (this.ball.y > 600)
        {
            this.resetBall();
        }
    }

};

var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    scene: [ Breakout ],
    physics: {
        default: 'arcade'
    }
};

var game = new Phaser.Game(config);
```

We are now using Typescript!

And our project looks like this:

```apacheconf
breakout
|- /dist
|- /node_modules
|- /src
  |- /images
    |- breakout.png
    |- breakout.json
  |- breakout.ts
  |- index.html
|- package.json
|- package-lock.json
|- tsconfig.json
|- webpack.common.js
|- webpack.dev.js,
|- webpack.prod.js
```

Lastly, let's talk about breaking up our source code. Right now it's not too hard to work with, but as it grows, we are going to want to be able to manage our source better and that means breaking it up and thinking more about Object Oriented Programming.

Our project actually has a decent amount of parts right now. We have some initialization, a scene, bricks, a ball and a paddle. Each one of these could become more complex over time and by separating them, we make it easier to manage by encapsulating the code that's relevant to each type of thing withing a class.

For now, let's just separate out the ball. Make a ball.ts file with a Ball class inside and copy the relevant code over. We will also need to export the class so we can import it in to our main file.

```typescript
export default class Ball extends Phaser.GameObjects.GameObject
{
    image: Phaser.Physics.Arcade.Image;
    paddle: Phaser.Physics.Arcade.Image;
    onPaddle: Boolean;
    
    constructor(scene: Phaser.Scene, paddle: Phaser.Physics.Arcade.Image)
    {
        super(scene, "ball");
        this.paddle = paddle;

        this.create();
    }

    create()
    {
        this.image = this.scene.physics.add.image(400, 500, 'assets', 'ball1').setCollideWorldBounds(true).setBounce(1);
        this.onPaddle = true;

        this.scene.input.on('pointerup', function () {

            if (this.onPaddle)
            {
                this.image.setVelocity(-75, -300);
                this.onPaddle = false;
            }

        }, this);
    }

    reset()
    {
        this.image.setVelocity(0);
        this.image.setPosition(this.paddle.x, 500);
        this.onPaddle = true;
    }

    hitPaddle(ballImage: Phaser.Physics.Arcade.Image, paddleImage: Phaser.Physics.Arcade.Image)
    {
        var diff = 0;

        if (ballImage.x < paddleImage.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = paddleImage.x - ballImage.x;
            ballImage.setVelocityX(-10 * diff);
        }
        else if (ballImage.x > paddleImage.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = ballImage.x -paddleImage.x;
            ballImage.setVelocityX(10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ballImage.setVelocityX(2 + Math.random() * 8);
        }
    }

    update()
    {
        if (this.onPaddle)
        {
            this.image.x = this.paddle.x;
        }
        if (this.image.y > 600)
        {
            this.reset();
        }
    }

};
```

It's important to note that the update method is not special in this case, so we will need to call it from our scene. Let's look at the updated scene code:

```typescript
import 'phaser'
import Ball from './ball'

class Breakout extends Phaser.Scene
{
    bricks: Phaser.Physics.Arcade.StaticGroup;
    paddle: Phaser.Physics.Arcade.Image;
    ball: Ball;
    
    constructor(config: Phaser.Types.Core.GameConfig)
    {
        super(config);
    }

    preload()
    {
        this.load.atlas('assets', 'images/breakout.png', 'images/breakout.json');
    }

    create()
    {
        //  Enable world bounds, but disable the floor
        this.physics.world.setBoundsCollision(true, true, true, false);

        //  Create the bricks in a 10x6 grid
        this.bricks = this.physics.add.staticGroup({
            key: 'assets', frame: [ 'blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1' ],
            frameQuantity: 10,
            gridAlign: { width: 10, height: 6, cellWidth: 64, cellHeight: 32, x: 112, y: 100 }
        });

        this.paddle = this.physics.add.image(400, 550, 'assets', 'paddle1').setImmovable();

        this.ball = new Ball(this, this.paddle);

        //  Our colliders
        this.physics.add.collider(this.ball.image, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball.image, this.paddle, this.ball.hitPaddle, null, this);

        //  Input events
        this.input.on('pointermove', function (pointer) {

            //  Keep the paddle within the game
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

        }, this);
    }

    hitBrick(ball: Phaser.Physics.Arcade.Image, brick: Phaser.Physics.Arcade.Image)
    {
        brick.disableBody(true, true);

        if (this.bricks.countActive() === 0)
        {
            this.resetLevel();
        }
    }

    resetLevel()
    {
        this.ball.reset();

        this.bricks.children.each(function (brick: Phaser.Physics.Arcade.Image) {

            brick.enableBody(false, 0, 0, true, true);

        });
    }

    update()
    {
        this.ball.update();
    }

};

var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    scene: [ Breakout ],
    physics: {
        default: 'arcade'
    }
};

var game = new Phaser.Game(config);
```

So now we are importing the ball class, instantiating a ball object and calling that object as needed.

This is good, but one thing you may have noticed is that we passed in a reference to our paddle image into our ball. This is okay, but has created tight coupling between these objects. A good way to loosen the coupling is through events.

Let's convert the paddle and bricks and use events to keep everything loosely coupled.

```typescript
export default class Paddle extends Phaser.GameObjects.GameObject
{
    image: Phaser.Physics.Arcade.Image;
    
    constructor(scene: Phaser.Scene)
    {
        super(scene, "paddle");

        this.create();
    }

    create()
    {
        this.image = this.scene.physics.add.image(400, 550, 'assets', 'paddle1').setImmovable();

        //  Input events
        this.scene.input.on('pointermove', function (pointer) {

            //  Keep the paddle within the game
            this.image.x = Phaser.Math.Clamp(pointer.x, 52, 748);

            this.emit("paddleMoved", this.image);

        }, this);
    }

};
```

```typescript
export default class Bricks extends Phaser.GameObjects.GameObject
{
    group: Phaser.Physics.Arcade.StaticGroup;
    
    constructor(scene: Phaser.Scene)
    {
        super(scene, "bricks");

        this.create();
    }

    create()
    {
        //  Create the bricks in a 10x6 grid
        this.group = this.scene.physics.add.staticGroup({
            key: 'assets', frame: [ 'blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1' ],
            frameQuantity: 10,
            gridAlign: { width: 10, height: 6, cellWidth: 64, cellHeight: 32, x: 112, y: 100 }
        });
    }

    reset()
    {
        this.group.children.each(function (brick: Phaser.Physics.Arcade.Image) {

            brick.enableBody(false, 0, 0, true, true);

        });
    }

    hitBrick(ball: Phaser.Physics.Arcade.Image, brick: Phaser.Physics.Arcade.Image)
    {
        brick.disableBody(true, true);

        if (this.group.countActive() === 0)
        {
            this.emit("bricksDestroyed");
        }
    }

};
```

```typescript
export default class Ball extends Phaser.GameObjects.GameObject
{
    image: Phaser.Physics.Arcade.Image;
    onPaddle: Boolean;
    
    constructor(scene: Phaser.Scene)
    {
        super(scene, "ball");

        this.create();
    }

    create()
    {
        this.image = this.scene.physics.add.image(400, 500, 'assets', 'ball1').setCollideWorldBounds(true).setBounce(1);
        this.onPaddle = true;

        this.scene.input.on('pointerup', function () {

            if (this.onPaddle)
            {
                this.image.setVelocity(-75, -300);
                this.onPaddle = false;
            }

        }, this);
    }

    reset(paddleImage: Phaser.Physics.Arcade.Image)
    {
        this.image.setVelocity(0);
        this.image.setPosition(paddleImage.x, 500);
        this.onPaddle = true;
    }

    hitPaddle(ballImage: Phaser.Physics.Arcade.Image, paddleImage: Phaser.Physics.Arcade.Image)
    {
        var diff = 0;

        if (ballImage.x < paddleImage.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = paddleImage.x - ballImage.x;
            ballImage.setVelocityX(-10 * diff);
        }
        else if (ballImage.x > paddleImage.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = ballImage.x -paddleImage.x;
            ballImage.setVelocityX(10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ballImage.setVelocityX(2 + Math.random() * 8);
        }
    }

    paddleMoved(paddleImage: Phaser.Physics.Arcade.Image)
    {
        if (this.onPaddle)
        {
            this.image.x = paddleImage.x;
        }
    }

    update()
    {
        if (this.image.y > 600)
        {
            this.emit("outOfBounds");
        }
    }

};
```

```typescript
import 'phaser'
import Ball from './ball'
import Bricks from './bricks'
import Paddle from './paddle'

class Breakout extends Phaser.Scene
{
    bricks: Bricks;
    paddle: Paddle;
    ball: Ball;
    
    constructor(config: Phaser.Types.Core.GameConfig)
    {
        super(config);
    }

    preload()
    {
        this.load.atlas('assets', 'images/breakout.png', 'images/breakout.json');
    }

    create()
    {
        //  Enable world bounds, but disable the floor
        this.physics.world.setBoundsCollision(true, true, true, false);

        this.bricks = new Bricks(this);
        this.paddle = new Paddle(this);
        this.ball = new Ball(this);

        //  Our colliders
        this.physics.add.collider(this.ball.image, this.bricks.group, this.bricks.hitBrick.bind(this.bricks), null, this);
        this.physics.add.collider(this.ball.image, this.paddle.image, this.ball.hitPaddle.bind(this.paddle), null, this);

        // Events
        this.bricks.on("bricksDestroyed", this.resetLevel.bind(this));
        this.paddle.on("paddleMoved", this.ball.paddleMoved.bind(this.ball));
        this.ball.on("outOfBounds", this.outOfBounds.bind(this));
    }

    resetLevel()
    {
        this.ball.reset(this.paddle.image);
        this.bricks.reset();
    }

    outOfBounds()
    {
        this.ball.reset(this.paddle.image);
    }

    update()
    {
        this.ball.update();
    }

};

var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    scene: [ Breakout ],
    physics: {
        default: 'arcade'
    }
};

var game = new Phaser.Game(config);
```

Notice that we emit events from our objects and our scene listens for those events and calls the corresponding object methods. Also notice our use of 'bind'. This ensures that 'this' is scoped to the right object. Here's the final project structure:

```apacheconf
breakout
|- /dist
|- /node_modules
|- /src
  |- /images
    |- breakout.png
    |- breakout.json
  |- ball.ts
  |- breakout.ts
  |- bricks.ts
  |- index.html
  |- paddle.ts
|- package.json
|- package-lock.json
|- tsconfig.json
|- webpack.common.js
|- webpack.dev.js,
|- webpack.prod.js
```

I hope you liked this dive in to TypeScript and this series of posts! Check out the [source](https://github.com/cjaube/phasertemplates/tree/master/breakout_part3) and Like or comment below!
