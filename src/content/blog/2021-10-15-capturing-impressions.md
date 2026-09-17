---
title: "Capturing Impressions"
date: 2021-10-15
categories: 
  - "web-development"
tags: 
  - "javascript"
coverImage: "pexels-photo-3769697.jpeg"
---

What is an impression? This is a term that is used typically when talking about advertising and the idea is that we want to know if something has been viewed. We can't know for sure that something was actually viewed, but we can make an educated guess. So the criteria we will use is that 50% of the pixels of the ad are viewable on the screen for at least 1 second. So, how do we determine this? That's the capturing part.

Traditionally, to track the movement of things on the screen you would have to listen for scroll events on any containers on the page that scroll and find the position of each item you care about within those containers to determine if the items are within the bounds of the viewable screen. There's a few problems with this, but let's take a look at what the code might look like anyway.

<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="MWmNKVN" data-user="cjaube" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;"><span>See the Pen <a href="https://codepen.io/cjaube/pen/MWmNKVN">Impressions</a> by Curtis Aube (<a href="https://codepen.io/cjaube">@cjaube</a>) on <a href="https://codepen.io">CodePen</a>.</span></p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

In the example above, when you scroll a blue box in to view, it turns green when an impression was captured. It works by listening for scroll events and then finding all the impressionable items in view. If items are found, it will wait a second and then check again. Items that are still there after a minute are added to a queue which is processed (turning the item green in this case) every 3 seconds or so.

You'll remember I said there were some problems. Well, you'll notice we have applied a throttle to our checkItems method. This is because the findVisibleItems method that is called is very expensive as it loops over every impressionable item and checks its bounds. We don't want to call this too much while you are scrolling or it will start to impact performance.

This is okay, but we can do better. The [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) provides a new way for us to track impressions. With a little configuration, it tracks the position and intersection of items and will call a method every time an observed object is considered in view. It also has great browser support if you don't need to support Internet Explorer.

First we need to configure the Intersection Observer.

```javascript
// Setup
let options = {
  root: document.querySelector('.scrolling-container'),
  rootMargin: '0px',
  threshold: 0.5
};

let observer = new IntersectionObserver(checkItems, options);
```

We've set the root to the same container as before. The rootMargin can be used to shrink the view area, but we can just set it to 0px. Then we set the threshold to 0.5 to say that we want to know when the items are 50% in view. We pass those options in to a new IntersectionObserver and specify a callback method named 'checkItems'. Easy, right?

Now we just need to tell it what items to observe.

```javascript
let targets = Array.from(document.getElementsByClassName('ad'));
targets.forEach((target) => {
  observer.observe(target);
});
```

We grabbed a list of impressionable items and then called observer.observe on each one.

Since our checkItems method is now provided a list of changed entries, we can simplify our code a bit to just start and clear timeouts based on wether items have come into or left the view. Check out the full example below.

<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="bGrEVLd" data-user="cjaube" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;"><span>See the Pen <a href="https://codepen.io/cjaube/pen/bGrEVLd">Impressions with Intersection Observer</a> by Curtis Aube (<a href="https://codepen.io/cjaube">@cjaube</a>) on <a href="https://codepen.io">CodePen</a>.</span></p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

It works just as it did before, only now we aren't doing any expensive operations on scroll, so we can remove that throttle from the checkItems method.

I hope you found this explanation valuable and would love to hear how you used the IntersectionObserver. Like and comment below!
