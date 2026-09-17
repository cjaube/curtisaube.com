---
title: "Colorized SVGs"
date: 2020-06-12
categories: 
  - "web-development"
tags: 
  - "jquery"
  - "svg"
  - "theming"
coverImage: "artists-paint-pots-and-brushes.jpg"
---

On to the topic of theming again! I talked about setting theme colors in my post [Automatic Theme Colors](https://curtisaube.com/?p=58), but what happens when we also need to change the color of our icons? One solution is to use an icon font. The advantage is that it allows you to change the color simply by changing the font color, but there are [many issues with icon fonts](https://cloudfour.com/thinks/seriously-dont-use-icon-fonts/) probably due to the fact that fonts were never meant to be used this way. Another solution is to use SVGs. These days there is really great browser support for SVGs, they scale well and as we'll find out in a minute, they can be colorized.

First off, how do you add an SVG? You can add it just like any other image using the img element. Also, just like any other image, you can include it as a background. These are great but they are hard to colorize. One really cool feature of SVG though is that you can embed it inline.

Since SVGs are really just xml, you can drop the SVG element from the file straight into your HTML. Now that we have it there, we can color it with css!

\[codepen\_embed height="265" theme\_id="dark" slug\_hash="wvMGLoq" default\_tab="css,result" user="cjaube"\]See the Pen [Colorizing an SVG](https://codepen.io/cjaube/pen/wvMGLoq) by Curtis Aube ([@cjaube](https://codepen.io/cjaube)) on [CodePen](https://codepen.io).\[/codepen\_embed\]

This is great, but it might be a little cumbersome to hand copy the contents of your SVG files into your HTML files. To solve this, you can add some backend processing or you could do it on the frontend. Let's take a look at how to do with with a jQuery widget.

\[codepen\_embed height="265" theme\_id="dark" slug\_hash="yLeOdvQ" default\_tab="js,result" user="cjaube"\]See the Pen [JQuery Inline SVGs](https://codepen.io/cjaube/pen/yLeOdvQ) by Curtis Aube ([@cjaube](https://codepen.io/cjaube)) on [CodePen](https://codepen.io).\[/codepen\_embed\]

Okay, let's take a minute to break this apart. We've defined our HTML as a span with a data attribute for the SVG.

```markup
<span class="arrow" data-inline-svg="https://image.flaticon.com/icons/svg/860/860780.svg"></span>
```

We could have made this a img element with a src attribute, but instead of letting the browser fetch the SVG, we want to do it ourselves. Note that the data-inline-svg url would normally point to a file on our own server (If the example isn't working, the image probably moved).

Now that we have that, we can make our widget. First of all, widgets are part of the jQuery ui, so we need to make sure to include that JavaScript library. Then on the first line we define the widget and the function called \_create is the entry point of the widget.

In our \_create function we gather all the information from the span, get the contents of the SVG file, set the class and id if needed, and replace the span with our inline SVG. After the widget is defined, we find elements that have our data-inline-svg attribute and activate the widget.

```javascript
$('[data-inline-svg]').inlinesvg();
```

Now we can store our SVGs as files and still have them inline for colorizing!

And there you have it! I hope you enjoyed this post. Comment or like below!
