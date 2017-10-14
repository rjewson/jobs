var test = require("tape");
var { observable, observe, autorun, computed } = require("../dist/jobs.js");

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
    console.log('get tax')
    return this.total * 0.15;
  }
});

const obsTotal = autorun(() => {
  console.log("Total=" + (o.total));
});

const obsTax = autorun(() => {
  console.log("Tax=" + (o.tax));
});

o.a = 2;

// console.log("----");
// console.log(o.total);
