'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const targets = new Map();
const observables = new Map();

const targePropertytToComputed = new Map();

const computeds = new Map();

let runningComputation = null;

const observable = target => {
  return toObservable(target);
};

const observe = () => {};

const computed = fn => {
  computeds.set(fn,fn);
  runComputed(fn);
  return fn;
};

const runComputed = fn => {
  runningComputation = fn;
  fn();
  runningComputation = null;
};

const registerPropertyAccessToComputation = (target, key) => {
  if (runningComputation) {
    targePropertytToComputed.get(target).set(key,runningComputation);
  }
};

const toObservable = target => {
  const observable = new Proxy(target, {
    get: (target, key, receiver) => {
      const result = Reflect.get(target, key, receiver);
      registerPropertyAccessToComputation(target,key);
      console.log(`Get ${key.toString()} = ${result}`);
      return result;
    },
    set: (target, key, value, receiver) => {
      console.log(`Set ${key.toString()} = ${value}`);
      return Reflect.set(target, key, value, receiver);
    }
  });
  targets.set(target, observable);
  observables.set(observable, target);
  targePropertytToComputed.set(target, new Map());
  return observable;
};

exports.observable = observable;
exports.observe = observe;
exports.computed = computed;
