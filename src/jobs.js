// @ts-check

/*
 * Javascript Observable
 * 
 * a lightweight proxy based observable implementation
 * 
 */

/*
 * A badly named map:
 * Key = the underling target obseverd object (array, object etc)
 * Value = a map:
 *    Key = The key of a property on the target object
 *    Value = A set of observer functions passed via 'autorun'
 */
const targetPropertyToComputed = new Map();
/*
 * Just a map of all the autoruns
 */
const computeds = new Map();
/*
 * A set of all autoruns that need to be run this 'tick'
 */
const dirtyComputations = new Set();

let recomputeTimeout = null;
let runningComputation = null; 
let id = 0;

/*
 * Public api
 */
export const observable = target => { 
  return toObservable(target);
};

export const autorun = (fn, name = "unknown") => {
  const observer = { fn, name };
  //Save them, for later...?
  computeds.set(fn, observer);
  runComputed(observer);
  return removeAutorun(observer);
};

/*
 * TODO Use this to memozie?
 */
export function computed(target, key, descriptor) {
  //NOOP
  return descriptor;
}

export const reset = () => {
  targetPropertyToComputed.clear();
  computeds.clear();
  dirtyComputations.clear();
  recomputeTimeout = null;
  runningComputation = null;
  id = 0;
}

/*
 * Remove autorun from all
 */
const removeAutorun = observer => () => {
  targetPropertyToComputed.forEach(target => {
    target.forEach(keySet => {
      keySet.delete(observer);
    });
  });
  computeds.delete(observer.fn);
};

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
      targetObj.set(key, propertySet);
    }
    propertySet.add(runningComputation);
  }
};

/*
 * Copy all recomputations for target/key when it changes
 * Trigger them to run on next event loop
 */
const checkRecomputationNeeded = (target, key) => {
  const computations = targetPropertyToComputed.get(target).get(key);
  if (computations) {
    computations.forEach(dirtyComputations.add, dirtyComputations);
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

/*
 * Wrap an object in a Proxy, and return it
 */
const toObservable = targetObj => {
  targetObj.__id__ = id++;
  const proxy = new Proxy(targetObj, {
    get: (target, key, receiver) => {
      if (key === "__target__") {
        return target;
      }
      // if (key === "unobserve") {
      //   return () => unobserve(target);
      // }
      const result = Reflect.get(target, key, receiver);
      // TODO handle this?
      // if (result && Object.getOwnPropertyDescriptor(target, key).get) {
      // }
      registerPropertyAccessToComputation(target, key);
      if (runningComputation && isObject(result)) {
        const observableResult = observable(result);
        Reflect.set(target, key, observableResult, receiver);
        return observableResult;
      }
      return result;
    },
    set: (target, key, value, receiver) => {
      checkRecomputationNeeded(target, key);
      const result = Reflect.set(target, key, value, receiver);
      // console.log(result);
      return result;
    }
    // Apparently doesnt do what you think it does...
    // ,apply: (target, thisArg, argumentsList) => {
    //   // if (target === "unobserve") {
    //   //   return unobserve(target.__target__);
    //   // }
    // }
  });
  targetPropertyToComputed.set(targetObj, new Map());
  return proxy;
};

// Util stuff
const iterateObjectGraph = node => {
  if (isArray(node)) {
  } else if (isObject(node)) {
  }
};

const isArray = obj => Array.isArray;
const isObject = obj => obj === Object(obj);
