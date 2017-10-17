// @ts-check

const targetPropertyToComputed = new Map();

const computeds = new Map();

const dirtyComputations = new Set();

let recomputeTimeout = null;
let runningComputation = null;

export const observable = target => {
  return toObservable(target);
};

export const observe = () => {};

export const unobserve = (target) => {
  console.log("ToDo");
  return target;
}

export const autorun = (fn,name="unknown") => {
  const observer = {fn,name};
  computeds.set(fn, observer);
  return runComputed(observer);
};

var logger = m => console.log(m);

export function computed(target, key, descriptor) {
  return descriptor;
}

const runComputed = observer => {
  runningComputation = observer;
  const result = observer.fn();
  runningComputation = null;
  return result;
};

/*
 * Called whenever a property is accessed on an observable
 */

const registerPropertyAccessToComputation = (target, key) => {
  if (runningComputation) {
    const targetObj = targetPropertyToComputed.get(target);
    let propertySet = targetObj.get(key);
    if (!propertySet) {
      propertySet = new Set();
      targetObj.set(key,propertySet);
    }
    propertySet.add(runningComputation);
    console.log(targetObj);    
  }
};

const checkRecomputationNeeded = (target, key) => {
  // console.log('checking...');
  const computations = targetPropertyToComputed.get(target).get(key);
  // console.log(computations);
  if (computations) {
    computations.forEach(dirtyComputations.add,dirtyComputations);
    if (recomputeTimeout == null)
      recomputeTimeout = setTimeout(recomputeComputations, 0);
  }
};

/*
 * Rerun all 'dirty' computations
 */
const recomputeComputations = () => {
  dirtyComputations.forEach(observer => observer.fn());
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
      if (key === "__target__") {
        return target;
      }
      if (key === "unobserve") {
        return () => unobserve(target);
      }
      const result = Reflect.get(target, key, receiver);
      if (result && Object.getOwnPropertyDescriptor(target, key).get) {
        //TODO handle this?
      }
      registerPropertyAccessToComputation(target, key);
      if (runningComputation && isObject(result)) {
        console.log("make nested:"+key.toString());
        const observableResult = observable(result);
        Reflect.set(target, key, observableResult, receiver);
        return observableResult
      }
      //console.log(`Get ${key.toString()} = ${result}`);
      return result;
    },
    set: (target, key, value, receiver) => {
      // console.log(`Set ${key.toString()} = ${value}`);
      checkRecomputationNeeded(target, key);
      const result = Reflect.set(target, key, value, receiver);
      // console.log(result);
      return result;
    }
    // ,apply: (target, thisArg, argumentsList) => {
    //   console.log("!! target");
    //   // if (target === "unobserve") {
    //   //   return unobserve(target.__target__);
    //   // }
    // }
  });
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