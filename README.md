# jobs - javascript observable

Zero dependancy observable/reactive library. Like Mobx, but smaller. And less functional.

Wrap object graphs with an observable proxy.  Then create MobX like autoruns around side-effects.

Todo:
- Memoization

## Examples

A basic example with getters.

```js
var { observable, autorun } = require("jobs.js");

const fruit = observable({
  apples: 5,
  oranges: 5,
  get total() {
    return this.a + this.b;
  },
  get tax() {
    return this.total * 0.15;
  },
});

const totalFruit = autorun(() => {
  console.log("Total=" + (fruit.apples + fruit.oranges));
});

const totalFruitGetter = autorun(() => {
  console.log("Total=" + (fruit.total));
});

const taxGetter = autorun(() => {
  console.log("Tax=" + (fruit.tax));
});

fruit.apples = 6;

//Logs 11,11,1.65

```

Deep nested objects are also handled.

```js
var o = observable({
  a: []
});

const obsLen = autorun(() => {
  console.log("Len=" + (o.len));
},"Calc Len");

o.a.push(1);

// Len = 1
```

## API

### observable(target)

Wraps the target is an observable proxy.  Target can be composed of [] or {} nested to any depth.  You can access the underlying target if you ever need to via the __target__ property.  The observable can be mutated after creation.

### autorun(fn,?name)

Creates an autorun observer (like Mobx).  The function fn will be exected once at creation, and all its dependancies tracked.  When these dependacies change, the function will re-run.  Name is an optional paramenter.  Autorun returns a function that cancels the observer internally, use this to clean up unneed autoruns.

Reference:
- http://www.knockmeout.net/2014/05/knockout-dependency-detection.html