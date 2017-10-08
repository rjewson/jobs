# jobs - javascript observable

Zero dependancy observable/reactive library. Like Mobx, but smaller. And less functional.

```js
var { observable, observe, computed } = require("jobs.js");

const fruit = observable({
  apples: 5,
  oranges: 5
});

const totalFruit = computed(() => {
  console.log("Total=" + (fruit.apples + fruit.oranges));
});

fruit.apples = 6;

//Logs 11

```

Reference:
- http://www.knockmeout.net/2014/05/knockout-dependency-detection.html