var test = require("tape");
var {observable,observe,computed} = require("../dist/jobs.js");

const test1 = {
  "k1":"v1",
  "k2":"v2",
  "k3":"v3"
}

const obs1 = observable(test1);

const comp1 = computed(()=>{
  console.log("Comp:" + obs1.k1 + " " + obs1.k2);
});

