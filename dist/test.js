var test = require("tape");

var _require = require("../dist/jobs.js"),
    observable = _require.observable,
    observe = _require.observe,
    autorun = _require.autorun,
    computed = _require.computed;

// test("Basic Test 1", (t) => {
//   t.plan(2);

//   let obs = observable({
//     a: 1
//   });

//   const result = [1,2];
//   let testRun = 0;

//   autorun(() => {
//     t.equal(obs.a,result[testRun++]);
//   });

//   setTimeout(() => {
//     obs.a = 2;
//   }, 1);
// });

var o = observable({
  a: 1,
  b: 1,
  c: [],
  d: {
    e: {
      f: 10
    }
  },
  // @computed
  get total() {
    return this.a + this.b;
  },
  get tax() {
    return this.total * 0.15;
  },
  get len() {
    return this.c.length;
  }
});

// const obsTotal = autorun(() => {
//   console.log("Total=" + (o.total));
// },"Calc Total");

// const obsTax = autorun(() => {
//   console.log("Tax=" + (o.tax));
// },"Calc Tax");

// const obsLen = autorun(() => {
//   console.log("Len=" + o.len);
// }, "Calc Len");

var obsNested = autorun(function () {
  console.log("F=" + o.d.e.f);
}, "Nested");
o.d.e.f = 11;
// o.a = 2;

o.c.push(1);
o.c.push(1);

// console.log(o.unobserve());
//o.c.pop();

// console.log("----");
// console.log(o.total);
