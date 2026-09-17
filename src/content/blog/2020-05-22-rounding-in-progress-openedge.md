---
title: "Rounding and TDD in Progress OpenEdge"
date: 2020-05-22
categories: 
  - "progress-openedge"
tags: 
  - "openedge"
  - "progress"
  - "rounding"
  - "tdd"
  - "test-driven-development"
  - "truncate"
coverImage: "the-round-tower-inside-in-the-building-in-kabenhavn-denmark.jpg"
---

Have you ever needed to round something up or down to a certain number of decimal places? This is pretty common, especially when dealing with currency. Progress OpenEdge has a built-in arithmetic function called round that can round to the nearest precision. It's used like this:

```c
round(45.566, 0).  // 46
round(45.566, 2).  // 45.57
round(45.565, 2).  // 45.57
round(45.564, 2).  // 45.56
round(-45.566, 0). // -46
round(-45.566, 2).  // -45.57
round(-45.565, 2).  // -45.57
round(-45.564, 2).  // -45.56
```

So we can see here that the first parameter is the number we are rounding and the second parameter is the precision. It's interesting to note that it is rounding .5 away from 0 and not just up as the [documentation](https://documentation.progress.com/output/ua/OpenEdge_latest/index.html#page/gsabl/arithmetic-built-in-functions.html) seems to state.

Another arithmetic function we have available to us is called truncate. Here's what it looks like:

```c
truncate(45.566, 0).  // 45
truncate(45.566, 2).  // 45.56
truncate(-45.566, 0). // -45
truncate(-45.566, 2).  // -45.56
```

Basically, it's just chopping off the decimal places beyond the precision. Notice in this case it is always rounding toward 0 (rounding down when positive and rounding up when negative).

Both of these are fine, but we want to round in a certain direction and neither of these quite do that. So, let's make our own RoundUp and RoundDown functions using this same signature. These kind functions are a great candidate for Test-Driven Development (TDD). We know exactly what signature our function needs and we know exactly what we expect this function to output. Let's start with an empty function called RoundDown.

```c
function RoundDown returns decimal (expression as decimal, precision as int):
  return 0.
end function.
```

Now let's write a test for it.

```c
Assert:Equals( 4   , RoundDown( 4.4536, 0)).
```

And of course it fails. To make this test work, we can just use truncate.

```c
function RoundDown returns decimal (expression as decimal, precision as int):
  return truncate(expression, precision).
end function.
```

We can write a lot more asserts to test that positive numbers are rounding down.

```c
  Assert:Equals(  4.4 , RoundDown( 4.4689, 1)). // Precision of 1
  Assert:Equals(  4.46, RoundDown( 4.4689, 2)). // Precision of 2
  Assert:Equals( 45.28, RoundDown(45.288 , 2)). // Round down when multiple digits
  Assert:Equals(  5.12, RoundDown( 5.12  , 2)). // Don't do anything when already rounded
```

Once we throw in some negative tests, it fails again.

```c
  Assert:Equals( -4.33, RoundDown(-4.322 , 2)). // Round down negative numbers
  Assert:Equals(-10.00, RoundDown(-9.999 , 2)). // Round down negative with carry
```

To fix this, we need to explicitly check for numbers less than 0 and then subtract 1 at the precision before truncating to force it to round down.

```c
function RoundDown returns decimal (expression as decimal, precision as int):
  if expression < 0 then do:
    return truncate(expression - 1 / exp(10, precision), precision).
  end.
  return truncate(expression, precision).
end function.
```

This works, but it reminds us that we also need to test when the negative number doesn't need to be rounded.

```c
Assert:Equals( -5.12, RoundDown(-5.12  , 2)). // Don't do anything when already rounded
```

Yup. We failed again. So let's check for that.

```c
function RoundDown returns decimal (expression as decimal, precision as int):
  if expression < 0 then do:
    if truncate(expression, precision) = expression then return expression.
    return truncate(expression - 1 / exp(10, precision), precision).
  end.
  return truncate(expression, precision).
end function.
```

It's passing again! Yay! This is looking pretty good, but we need to check one more thing. Precision should not be negative. Let's add some tests for that.

```c
  RoundDown(7.467, -2) no-error.                // Invalid parameters
  AssertError:HasErrorStatus().
  RoundDown(-7.467, -2) no-error.               // Invalid parameters
  AssertError:HasErrorStatus().
```

This actually passes. This is because truncate is throwing the error, "Decimal precision cannot be negative." Just to make this a little cleaner, let's throw our own error rather than relying on the truncate function to do it for us.

```c
function RoundDown returns decimal (expression as decimal, precision as int):
  if precision < 0 then undo, throw new Progress.Lang.AppError("Negative precision not allowed in RoundDown function.",0).
  if expression < 0 then do:
    if truncate(expression, precision) = expression then return expression.
    return truncate(expression - 1 / exp(10, precision), precision).
  end.
  return truncate(expression, precision).
end function.
```

And there's the final version! We discovered the need for a specific function and we used TDD to write a robust solution. Following this same process, you could write an equally robust RoundUp method. In fact, I've already done that. Check the [source](https://github.com/cjaube/OpenEdgeUtilities/blob/master/source/Includes/Rounding.i) for the full RoundDown and RoundUp functions and make sure to grab the [tests](https://github.com/cjaube/OpenEdgeUtilities/blob/master/tests/TestRounding.p) as well.

One of the great things about writing our functions this way is that if we ever need to change these functions (to make them more efficient for instance), we have the safety net of the unit tests to ensure that we don't break the expected behavior in the process.

I hope you enjoyed this post. Hit the like button. Comment below to let me know what you think or to let me know what you might like to see next.
