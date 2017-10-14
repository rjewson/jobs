var test = require("tape");

var _require = require("../dist/jobs.js"),
    observable = _require.observable,
    observe = _require.observe,
    autorun = _require.autorun,
    computed = _require.computed;

// const fruit = observable({
//   apples: 5,
//   oranges: 5
// });

// const totalFruit = autorun(() => {
//   console.log("Total=" + (fruit.apples + fruit.oranges));
// });
//Logs 11
// fruit.apples = 6;

var o = observable({
  a: 1,
  b: 1,
  // @computed
  get total() {
    console.log('get total');
    return this.a + this.b;
  },
  get tax() {
    console.log('get tax');
    return this.total * 0.15;
  }
});

var obsTotal = autorun(function () {
  console.log("Total=" + o.total);
});

var obsTax = autorun(function () {
  console.log("Tax=" + o.tax);
});

o.a = 2;

// console.log("----");
// console.log(o.total);
