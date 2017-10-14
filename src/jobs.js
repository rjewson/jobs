// @ts-check

const targets = new Map();
const observables = new Map();

const targetPropertyToComputed = new Map();

const computeds = new Map();

const dirtyComputations = new Set();
let recomputeTimeout = null;

let runningComputation = null;

export const observable = target => {
  return toObservable(target);
};

export const observe = () => {};

export const autorun = fn => {
  computeds.set(fn, fn);
  return runComputed(fn);
};

var logger = m => console.log(m);


export function computed(target, key, descriptor) {
  // logger("--");
  //const getter = Object.getOwnPropertyDescriptor(target, key).get;
  // logger(getter);
  //descriptor.get = getter;
  return descriptor;
}

const runComputed = fn => {
  runningComputation = fn;
  const result = fn();
  runningComputation = null;
  return result;
};

/*
 * Called whenever a property is accessed on an observable
 * 
 */

const registerPropertyAccessToComputation = (target, key) => {
  if (runningComputation) {
    const targetObj = targetPropertyToComputed.get(target);
    let propertySet = targetObj.get(key);
    if (!propertySet) {
      propertySet = new Set();
      targetObj.set(key,propertySet);
      console.log(targetObj);
    }
    propertySet.add(runningComputation);
  }
};

const checkRecomputationNeeded = (target, key) => {
  console.log('checking...');
  const computations = targetPropertyToComputed.get(target).get(key);
  console.log(computations);
  if (computations) {
    computations.forEach(dirtyComputations.add,dirtyComputations);
    if (recomputeTimeout == null)
      recomputeTimeout = setTimeout(recomputeComputations, 0);
  }
};

const recomputeComputations = () => {
  // console.log("Dirty");
  // console.log(dirtyComputations);
  dirtyComputations.forEach(fn => fn());
  dirtyComputations.clear();
  recomputeTimeout = null;
};

let id = 0;
const toObservable = targetObj => {
  targetObj.__id__ = id++;
  // console.log(targetObj);
  const proxy = new Proxy(targetObj, {
    get: (target, key, receiver) => {
      // console.log('!',target,key);
      const result = Reflect.get(target, key, receiver);
      registerPropertyAccessToComputation(target, key);
      console.log(`Get ${key.toString()} = ${result}`);
      return result;
    },
    set: (target, key, value, receiver) => {
      console.log(`Set ${key.toString()} = ${value}`);
      checkRecomputationNeeded(target, key);
      return Reflect.set(target, key, value, receiver);
    }
  });
  // targets.set(targetObj, proxy);
  // observables.set(proxy, targetObj);
  targetPropertyToComputed.set(targetObj, new Map());
  return proxy;
};

const iterateObjectGraph = node => {
  if (isArray(node)) {
  } else if (isObject(node)) {
  }
};

const isArray = obj => Array.isArray;
const isObject = obj => obj === Object(obj);

// inside getter, on child property change, trigger dirty on self