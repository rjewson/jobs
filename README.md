# jobs - javascript observable

Zero dependancy observable/reactive library. Like Mobx, but smaller. And less functional.

Wrap object graphs with an observable proxy.  Then create MobX like autoruns around side-effects.

Todo:
- Memoization

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

Reference:
- http://www.knockmeout.net/2014/05/knockout-dependency-detection.html