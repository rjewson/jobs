var test = require("tape");
var { observable, observe, computed } = require("../dist/jobs.js");

const fruit = observable({
  apples: 5,
  oranges: 5
});

const totalFruit = computed(() => {
  console.log("Total=" + (fruit.apples + fruit.oranges));
});

fruit.apples = 6;

//Logs 11
