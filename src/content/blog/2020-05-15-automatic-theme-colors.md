---
title: "Automatic Theme Colors"
date: 2020-05-15
categories: 
  - "progress-openedge"
  - "web-development"
tags: 
  - "color"
  - "contrast"
  - "openedge"
  - "progress"
  - "wcag"
coverImage: "primary-school-pencils-and-apple.jpg"
---

I recently received a task to make a website themeable. The user would be able to select a small set of theme colors and all the colors used in the app would then be based on those theme colors. This means automatically selecting appropriate additional colors. Let's look at how to solve this with CSS variables and Progress OpenEdge.

The first problem to solve is having a color be applied to the entire stylesheet. You could embed CSS that overrides every CSS selector that sets color, or you could use CSS variables. The downside to CSS variables is that it is [not supported in any version of IE](https://caniuse.com/#feat=css-variables). We decided to go with CSS variables despite this drawback and just set default colors for IE.

We will be setting our css variables using an embedded stylesheet. Let's assume we have our hex colors selected and assigned already.

```c
  OutputText = 
    '<style>~n' +
      ':root ~{~n' +
        '--primary-color: ' + primaryColorHex + ';~n' +
        '--secondary-color: ' + secondaryColorHex + ';~n' +
      '~}~n' +
    '</style>'.
```

Then we can use our new variables to assign the colors.

```css
.button.primary {
  background: #266dd3;
  background: var(--primary-color);
}
.button.secondary {
  background: #0a7ab8;
  background: var(--secondary-color);
}
```

Okay. Now that we have that, we can start calculating additional colors. We will want a way to take an existing color and darken it by a percentage (for hover effects) and we will also want a way to pick a contrasting color (for text).

I decided to go ahead and create a Color class. The constructor can take an rgb or hex formatted color and it breaks it down into its Red, Green, and Blue values. It also has a ToHexString method that converts it back to a usable hex string. To start, let's take a look at the 'Darken' method.

```c
  method public Color Darken(percent as int):
    define variable amount as int no-undo.
    
    assign
      amount = Clamp(percent, 0, 100) / 100 * 255
      Red = Clamp(Red - amount, 0, 255)
      Green = Clamp(Green - amount, 0, 255)
      Blue = Clamp(Blue - amount, 0, 255).
    
    return this-object.
  end method.
```

Color values are between 0 and 255, but to make it easier on ourselves, we are passing in a percent between 0 and 100 (Clamp is a private method of our Color class). We simply apply the same amount of darkening to each color to achieve the desired effect.

That wasn't too hard, eh? Now we get to the fun stuff: Picking contrasting colors. First, we need to be able to determine the contrast ratio between two colors. For this, we need to take a quick peek at the [WCAG definition of contrast ratio](https://www.w3.org/WAI/GL/wiki/Contrast_ratio). The contrast ratio is a range from 1 to 21 which is determined by the relative luminance of each color. What is the relative luminance? For that, we need to look at the [WCAG definition of relative luminance](https://www.w3.org/WAI/GL/wiki/Relative_luminance). Basically, it is a decimal between 0 and 1 where 0 is the darkest color (black) and 1 is the brightest color (white). If you take a look at the math you'll see that it's not exactly linear. Each color (Red, Green, and Blue) has a different weight and darker values are treated differently than lighter values. View the [full source](https://github.com/cjaube/OpenEdgeUtilities/blob/master/source/Color.cls) to see what these methods look like.

With all that out of the way, we can finally pick our contrasting colors. I created a method that takes a minimum contrast value and a list of hex colors to pick from.

```c
  method public Color PickContrastingColor(minimumContrast as decimal, colors as character):
    define variable ix as int no-undo.
    define variable testColor as Color no-undo.
    define variable testRatio as decimal no-undo.
    define variable bestColor as Color no-undo.
    define variable bestRatio as decimal no-undo.

    do ix = 1 to num-entries(colors):
      testColor = new Color(entry(ix, colors)).
      testRatio = ContrastRatio(testColor).
      if bestColor = ? or
          (testRatio >= minimumContrast and (bestRatio < minimumContrast or testRatio < bestRatio)) or
          (testRatio < minimumContrast and bestRatio < minimumContrast and testRatio > bestRatio) then 
        assign
          bestColor = testColor
          bestRatio = testRatio.
    end.
    
    return bestColor.
  end.
```

Each hex color is converted to a Color object and the contrast ratio is determined. The closest color that meets the minimum contrast will be returned. If no color meets the minimum contrast, then the highest contrasting color will be returned.

Now that we have our Color class with the necessary methods, we can start using it to calculate all the colors that we need.

```c
  assign  
    primaryColor = new Color(primaryColorHex)
    secondaryColor = new Color(secondaryColorHex)
    primaryHoverColor = cast(primaryColor:Clone(), Color):Darken(3)
    primaryTextColor = primaryColor:PickContrastingColor(4.5, "#ffffff,#272c33,#000000")
    secondaryHoverColor = cast(secondaryColor:Clone(), Color):Darken(3)
    secondaryTextColor = secondaryColor:PickContrastingColor(4.5, "#ffffff,#272c33,#000000").
  OutputText = 
    '<style>~n' +
      ':root ~{~n' +
        '--primary-color: ' + primaryColor:ToHexString() + ';~n' +
        '--secondary-color: ' + secondaryColor:ToHexString() + ';~n' +
        '--primary-hover-color: ' + primaryHoverColor:ToHexString() + ';~n' +
        '--primary-text-color: ' + primaryTextColor:ToHexString() + ';~n' +
        '--secondary-hover-color: ' + secondaryHoverColor:ToHexString() + ';~n' +
        '--secondary-text-color: ' + secondaryTextColor:ToHexString() + ';~n' +
      '~}~n' +
    '</style>'.
```

And then we can use them in our stylesheet.

```css
.button.primary {
  background: #266dd3;
  background: var(--primary-color);
  color: var(--primary-text-color);
}

.button.primary:hover {
  background: var(--primary-hover-color);
}

.button.secondary {
  background: #0a7ab8;
  background: var(--secondary-color);
  color: var(--secondary-text-color);
}

.button.secondary:hover {
  background: var(--secondary-hover-color);
}
```

That's it! Make sure to check out the [full source](https://github.com/cjaube/OpenEdgeUtilities/blob/master/source/Color.cls) and leave a comment to me know what you think!
