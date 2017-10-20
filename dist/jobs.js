'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
const observable = target => { 
  return toObservable(target);
};

const autorun = (fn, name = "unknown") => {
  const observer = { fn, name };
  //Save them, for later...?
  computeds.set(fn, observer);
  runComputed(observer);
  return removeAutorun(observer);
};

/*
 * TODO Use this to memozie?
 */
function computed(target, key, descriptor) {
  //NOOP
  return descriptor;
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

const isObject = obj => obj === Object(obj);

exports.observable = observable;
exports.autorun = autorun;
exports.computed = computed;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam9icy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2pvYnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWNoZWNrXG5cbi8qXG4gKiBKYXZhc2NyaXB0IE9ic2VydmFibGVcbiAqIFxuICogYSBsaWdodHdlaWdodCBwcm94eSBiYXNlZCBvYnNlcnZhYmxlIGltcGxlbWVudGF0aW9uXG4gKiBcbiAqL1xuXG4vKlxuICogQSBiYWRseSBuYW1lZCBtYXA6XG4gKiBLZXkgPSB0aGUgdW5kZXJsaW5nIHRhcmdldCBvYnNldmVyZCBvYmplY3QgKGFycmF5LCBvYmplY3QgZXRjKVxuICogVmFsdWUgPSBhIG1hcDpcbiAqICAgIEtleSA9IFRoZSBrZXkgb2YgYSBwcm9wZXJ0eSBvbiB0aGUgdGFyZ2V0IG9iamVjdFxuICogICAgVmFsdWUgPSBBIHNldCBvZiBvYnNlcnZlciBmdW5jdGlvbnMgcGFzc2VkIHZpYSAnYXV0b3J1bidcbiAqL1xuY29uc3QgdGFyZ2V0UHJvcGVydHlUb0NvbXB1dGVkID0gbmV3IE1hcCgpO1xuLypcbiAqIEp1c3QgYSBtYXAgb2YgYWxsIHRoZSBhdXRvcnVuc1xuICovXG5jb25zdCBjb21wdXRlZHMgPSBuZXcgTWFwKCk7XG4vKlxuICogQSBzZXQgb2YgYWxsIGF1dG9ydW5zIHRoYXQgbmVlZCB0byBiZSBydW4gdGhpcyAndGljaydcbiAqL1xuY29uc3QgZGlydHlDb21wdXRhdGlvbnMgPSBuZXcgU2V0KCk7XG5cbmxldCByZWNvbXB1dGVUaW1lb3V0ID0gbnVsbDtcbmxldCBydW5uaW5nQ29tcHV0YXRpb24gPSBudWxsOyBcbmxldCBpZCA9IDA7XG5cbi8qXG4gKiBQdWJsaWMgYXBpXG4gKi9cbmV4cG9ydCBjb25zdCBvYnNlcnZhYmxlID0gdGFyZ2V0ID0+IHsgXG4gIHJldHVybiB0b09ic2VydmFibGUodGFyZ2V0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBhdXRvcnVuID0gKGZuLCBuYW1lID0gXCJ1bmtub3duXCIpID0+IHtcbiAgY29uc3Qgb2JzZXJ2ZXIgPSB7IGZuLCBuYW1lIH07XG4gIC8vU2F2ZSB0aGVtLCBmb3IgbGF0ZXIuLi4/XG4gIGNvbXB1dGVkcy5zZXQoZm4sIG9ic2VydmVyKTtcbiAgcnVuQ29tcHV0ZWQob2JzZXJ2ZXIpO1xuICByZXR1cm4gcmVtb3ZlQXV0b3J1bihvYnNlcnZlcik7XG59O1xuXG4vKlxuICogVE9ETyBVc2UgdGhpcyB0byBtZW1vemllP1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZWQodGFyZ2V0LCBrZXksIGRlc2NyaXB0b3IpIHtcbiAgLy9OT09QXG4gIHJldHVybiBkZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgY29uc3QgcmVzZXQgPSAoKSA9PiB7XG4gIHRhcmdldFByb3BlcnR5VG9Db21wdXRlZC5jbGVhcigpO1xuICBjb21wdXRlZHMuY2xlYXIoKTtcbiAgZGlydHlDb21wdXRhdGlvbnMuY2xlYXIoKTtcbiAgcmVjb21wdXRlVGltZW91dCA9IG51bGw7XG4gIHJ1bm5pbmdDb21wdXRhdGlvbiA9IG51bGw7XG4gIGlkID0gMDtcbn1cblxuLypcbiAqIFJlbW92ZSBhdXRvcnVuIGZyb20gYWxsXG4gKi9cbmNvbnN0IHJlbW92ZUF1dG9ydW4gPSBvYnNlcnZlciA9PiAoKSA9PiB7XG4gIHRhcmdldFByb3BlcnR5VG9Db21wdXRlZC5mb3JFYWNoKHRhcmdldCA9PiB7XG4gICAgdGFyZ2V0LmZvckVhY2goa2V5U2V0ID0+IHtcbiAgICAgIGtleVNldC5kZWxldGUob2JzZXJ2ZXIpO1xuICAgIH0pO1xuICB9KTtcbiAgY29tcHV0ZWRzLmRlbGV0ZShvYnNlcnZlci5mbik7XG59O1xuXG5jb25zdCBydW5Db21wdXRlZCA9IG9ic2VydmVyID0+IHtcbiAgcnVubmluZ0NvbXB1dGF0aW9uID0gb2JzZXJ2ZXI7XG4gIGNvbnN0IHJlc3VsdCA9IG9ic2VydmVyLmZuKCk7XG4gIHJ1bm5pbmdDb21wdXRhdGlvbiA9IG51bGw7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKlxuICogQ2FsbGVkIHdoZW5ldmVyIGEgcHJvcGVydHkgaXMgYWNjZXNzZWQgb24gYW4gb2JzZXJ2YWJsZVxuICovXG5jb25zdCByZWdpc3RlclByb3BlcnR5QWNjZXNzVG9Db21wdXRhdGlvbiA9ICh0YXJnZXQsIGtleSkgPT4ge1xuICBpZiAocnVubmluZ0NvbXB1dGF0aW9uKSB7XG4gICAgY29uc3QgdGFyZ2V0T2JqID0gdGFyZ2V0UHJvcGVydHlUb0NvbXB1dGVkLmdldCh0YXJnZXQpO1xuICAgIGxldCBwcm9wZXJ0eVNldCA9IHRhcmdldE9iai5nZXQoa2V5KTtcbiAgICBpZiAoIXByb3BlcnR5U2V0KSB7XG4gICAgICBwcm9wZXJ0eVNldCA9IG5ldyBTZXQoKTtcbiAgICAgIHRhcmdldE9iai5zZXQoa2V5LCBwcm9wZXJ0eVNldCk7XG4gICAgfVxuICAgIHByb3BlcnR5U2V0LmFkZChydW5uaW5nQ29tcHV0YXRpb24pO1xuICB9XG59O1xuXG4vKlxuICogQ29weSBhbGwgcmVjb21wdXRhdGlvbnMgZm9yIHRhcmdldC9rZXkgd2hlbiBpdCBjaGFuZ2VzXG4gKiBUcmlnZ2VyIHRoZW0gdG8gcnVuIG9uIG5leHQgZXZlbnQgbG9vcFxuICovXG5jb25zdCBjaGVja1JlY29tcHV0YXRpb25OZWVkZWQgPSAodGFyZ2V0LCBrZXkpID0+IHtcbiAgY29uc3QgY29tcHV0YXRpb25zID0gdGFyZ2V0UHJvcGVydHlUb0NvbXB1dGVkLmdldCh0YXJnZXQpLmdldChrZXkpO1xuICBpZiAoY29tcHV0YXRpb25zKSB7XG4gICAgY29tcHV0YXRpb25zLmZvckVhY2goZGlydHlDb21wdXRhdGlvbnMuYWRkLCBkaXJ0eUNvbXB1dGF0aW9ucyk7XG4gICAgaWYgKHJlY29tcHV0ZVRpbWVvdXQgPT0gbnVsbClcbiAgICAgIHJlY29tcHV0ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KHJlY29tcHV0ZUNvbXB1dGF0aW9ucywgMCk7XG4gIH1cbn07XG5cbi8qXG4gKiBSZXJ1biBhbGwgJ2RpcnR5JyBjb21wdXRhdGlvbnNcbiAqL1xuY29uc3QgcmVjb21wdXRlQ29tcHV0YXRpb25zID0gKCkgPT4ge1xuICBkaXJ0eUNvbXB1dGF0aW9ucy5mb3JFYWNoKG9ic2VydmVyID0+IG9ic2VydmVyLmZuKCkpO1xuICBkaXJ0eUNvbXB1dGF0aW9ucy5jbGVhcigpO1xuICByZWNvbXB1dGVUaW1lb3V0ID0gbnVsbDtcbn07XG5cbi8qXG4gKiBXcmFwIGFuIG9iamVjdCBpbiBhIFByb3h5LCBhbmQgcmV0dXJuIGl0XG4gKi9cbmNvbnN0IHRvT2JzZXJ2YWJsZSA9IHRhcmdldE9iaiA9PiB7XG4gIHRhcmdldE9iai5fX2lkX18gPSBpZCsrO1xuICBjb25zdCBwcm94eSA9IG5ldyBQcm94eSh0YXJnZXRPYmosIHtcbiAgICBnZXQ6ICh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpID0+IHtcbiAgICAgIGlmIChrZXkgPT09IFwiX190YXJnZXRfX1wiKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICB9XG4gICAgICAvLyBpZiAoa2V5ID09PSBcInVub2JzZXJ2ZVwiKSB7XG4gICAgICAvLyAgIHJldHVybiAoKSA9PiB1bm9ic2VydmUodGFyZ2V0KTtcbiAgICAgIC8vIH1cbiAgICAgIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gICAgICAvLyBUT0RPIGhhbmRsZSB0aGlzP1xuICAgICAgLy8gaWYgKHJlc3VsdCAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KS5nZXQpIHtcbiAgICAgIC8vIH1cbiAgICAgIHJlZ2lzdGVyUHJvcGVydHlBY2Nlc3NUb0NvbXB1dGF0aW9uKHRhcmdldCwga2V5KTtcbiAgICAgIGlmIChydW5uaW5nQ29tcHV0YXRpb24gJiYgaXNPYmplY3QocmVzdWx0KSkge1xuICAgICAgICBjb25zdCBvYnNlcnZhYmxlUmVzdWx0ID0gb2JzZXJ2YWJsZShyZXN1bHQpO1xuICAgICAgICBSZWZsZWN0LnNldCh0YXJnZXQsIGtleSwgb2JzZXJ2YWJsZVJlc3VsdCwgcmVjZWl2ZXIpO1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZVJlc3VsdDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICBzZXQ6ICh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSA9PiB7XG4gICAgICBjaGVja1JlY29tcHV0YXRpb25OZWVkZWQodGFyZ2V0LCBrZXkpO1xuICAgICAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICAvLyBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgLy8gQXBwYXJlbnRseSBkb2VzbnQgZG8gd2hhdCB5b3UgdGhpbmsgaXQgZG9lcy4uLlxuICAgIC8vICxhcHBseTogKHRhcmdldCwgdGhpc0FyZywgYXJndW1lbnRzTGlzdCkgPT4ge1xuICAgIC8vICAgLy8gaWYgKHRhcmdldCA9PT0gXCJ1bm9ic2VydmVcIikge1xuICAgIC8vICAgLy8gICByZXR1cm4gdW5vYnNlcnZlKHRhcmdldC5fX3RhcmdldF9fKTtcbiAgICAvLyAgIC8vIH1cbiAgICAvLyB9XG4gIH0pO1xuICB0YXJnZXRQcm9wZXJ0eVRvQ29tcHV0ZWQuc2V0KHRhcmdldE9iaiwgbmV3IE1hcCgpKTtcbiAgcmV0dXJuIHByb3h5O1xufTtcblxuLy8gVXRpbCBzdHVmZlxuY29uc3QgaXRlcmF0ZU9iamVjdEdyYXBoID0gbm9kZSA9PiB7XG4gIGlmIChpc0FycmF5KG5vZGUpKSB7XG4gIH0gZWxzZSBpZiAoaXNPYmplY3Qobm9kZSkpIHtcbiAgfVxufTtcblxuY29uc3QgaXNBcnJheSA9IG9iaiA9PiBBcnJheS5pc0FycmF5O1xuY29uc3QgaXNPYmplY3QgPSBvYmogPT4gb2JqID09PSBPYmplY3Qob2JqKTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsTUFBTSx3QkFBd0IsR0FBRyxJQUFJ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
