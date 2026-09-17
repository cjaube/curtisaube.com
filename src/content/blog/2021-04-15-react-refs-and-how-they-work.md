---
title: "React Refs and How They Work"
date: 2021-04-15
categories: 
  - "web-development"
tags: 
  - "hooks"
  - "react"
  - "refs"
coverImage: "open-book.jpg"
---

The React framework conveniently abstracts away a lot of the manual DOM manipulation, so you normally don't need access to the raw DOM elements. But every so often you do. Maybe you need to find the position of a DOM element for instance. For this purpose, React has added a feature to reference DOM elements aptly named Refs. So to start, how do we use them?

If you are using class based React components, we use the createRef call, to create an object to hold our ref. Then we set the ref attribute of the element that we want to capture. The element reference will automatically be stored in the ref's `current` property. It looks a bit like this:

```jsx
import React from "react";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.boxRef = React.createRef();
  }

  handleClick() {
    let rect = this.boxRef.current.getBoundingClientRect();
    alert(`${rect.left}x${rect.top}`);
  }

  render() {
    return (
      <div className="App">
        <h1>Test</h1>
        <button onClick={() => this.handleClick()}>Where is it?</button>
        <div ref={this.boxRef}>Test box</div>
      </div>
    );
  }
}

// Alerts: 8x100.875
```

This is great, but it doesn't work if you are using functional components. Instead, we have to use the useRef hook. It looks like this:

```jsx
import React from "react";

export default function App() {
  const boxRef = React.useRef();

  const handleClick = () => {
    let rect = boxRef.current.getBoundingClientRect();
    alert(`${rect.left}x${rect.top}`);
  }

  return (
    <div className="App">
      <h1>Test</h1>
      <button onClick={handleClick}>Where is it?</button>
      <div ref={boxRef}>Test box</div>
    </div>
  );
}

// Alerts: 8x100.875
```

Okay, but why? The reason is that createRef only creates a single object instance. With a class component, this is fine because the component instance persists, but with functional components, a new ref instance would be created each time the component renders.

But, what's different about useRef? the useRef hook, will persist across multiple renders of a functional component. How does it do this? React uses the order that hooks are called in to determine which hook you are referencing and makes sure the same one is returned each time. We can verify this with the example below.

```jsx
import React from 'react';

export default function App() {
  const [clicked, setClicked] = React.useState();
  let ref1;
  let ref2;

  if (!clicked) {
    ref1 = React.useRef("one");
    ref2 = React.useRef("two");
  }
  else {
    ref2 = React.useRef("two");
    ref1 = React.useRef("one");
  }

  const handleClick = () => {
    setClicked(!clicked);
  };

  return (
    <div className="App">
      <h1>Test</h1>
      <button onClick={handleClick}>Click it</button>
      <div>{ref1.current} {ref2.current}</div>
    </div>
  );
}

// Before click: one two
// After click: two one
```

By the way, this example breaks the first [rule of hooks](https://reactjs.org/docs/hooks-rules.html). We should never put refs in a conditional or a loop, because you can get unexpected results as this example demonstrates. React even provides a [ESlint plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks) to catch this type of error.

So what if we need to store list of refs? We can't call useRef in a loop. One interesting thing about useRef is that it doesn't have to be used to hold a DOM reference. It can hold anything that you want to persist across multiple renders. So we can use it to hold an array or elements instead of a single element. Check out the example below.

```jsx
  const myRef = React.useRef([]);
  React.useEffect(() => {
    myRef.current = myRef.current.slice(0, boxes.length);
  }, [boxes]);

  return (
    <div>
      {boxes.map((box, i) => (
        <div key={i} ref={(el) => (myRef.current[i] = el)}>
          {box.label}
        </div>
      ))}
    </div>
  );
```

Now, the ref is initialized to an empty array. The element references need to be set manually with an inline function because the default behavior would replace our array instead of add to it. Then we maintain the correct size of the array using an effect hook.

We can also use an object instead of an array to hold our references. It might look a bit like this:

```jsx
  const myRef = React.useRef({});
  React.useEffect(() => {
    Object.keys(myRef.current).forEach(id => {
      if (!boxes.some(box => box.id === id)) {
        delete myRef.current[id];
      }
    });
  }, [boxes]);

  return (
    <div>
      {boxes.map((box) => (
        <div key={box.id} ref={(el) => (myRef.current[box.id] = el)}>
          {box.label}
        </div>
      ))}
    </div>
  );
```

This is similar to the array example, but we are using an id instead of the index. It's a little more tricky to trim down the object to only include the current references, but it can be done with a for each over the object keys. Without this, the object could grow over time.

Hopefully this helps clear up some things with refs and hooks. Like and leave a comment below!
