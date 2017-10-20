var test = require("tape");
var { observable, autorun, computed } = require("../dist/jobs.js");

let obs;

const delay = (t=0) => new Promise(r => setTimeout(r, t));

test("Basic Test 1", async t => {
  obs = observable({
    a: 1
  });

  const result = [1, 2];
  let testRun = 0;

  const cleanup = autorun(() => {
    t.equal(obs.a, result[testRun++]);
  });

  // await delay();
  obs.a = 2;
  await delay();
  cleanup();  
  t.end();
});

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

const obsNested = autorun(() => {
  console.log("F=" + o.d.e.f);
}, "Nested");
o.d.e.f = 11;
// o.a = 2;

o.c.push(1);
o.c.push(1);

obsNested();

// console.log(o.unobserve());
//o.c.pop();

// console.log("----");
// console.log(o.total);
