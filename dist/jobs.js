'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// @ts-check

var targetPropertyToComputed = new Map();

var computeds = new Map();

var dirtyComputations = new Set();

var recomputeTimeout = null;
var runningComputation = null;

var observable = function observable(target) {
  return toObservable(target);
};

var observe = function observe() {};

var unobserve = function unobserve(target) {
  console.log("ToDo");
  return target;
};

var autorun = function autorun(fn) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "unknown";

  var observer = { fn: fn, name: name };
  computeds.set(fn, observer);
  return runComputed(observer);
};

function computed(target, key, descriptor) {
  return descriptor;
}

var runComputed = function runComputed(observer) {
  runningComputation = observer;
  var result = observer.fn();
  runningComputation = null;
  return result;
};

/*
 * Called whenever a property is accessed on an observable
 */

var registerPropertyAccessToComputation = function registerPropertyAccessToComputation(target, key) {
  if (runningComputation) {
    var targetObj = targetPropertyToComputed.get(target);
    var propertySet = targetObj.get(key);
    if (!propertySet) {
      propertySet = new Set();
      targetObj.set(key, propertySet);
    }
    propertySet.add(runningComputation);
    console.log(targetObj);
  }
};

var checkRecomputationNeeded = function checkRecomputationNeeded(target, key) {
  // console.log('checking...');
  var computations = targetPropertyToComputed.get(target).get(key);
  // console.log(computations);
  if (computations) {
    computations.forEach(dirtyComputations.add, dirtyComputations);
    if (recomputeTimeout == null) recomputeTimeout = setTimeout(recomputeComputations, 0);
  }
};

/*
 * Rerun all 'dirty' computations
 */
var recomputeComputations = function recomputeComputations() {
  dirtyComputations.forEach(function (observer) {
    return observer.fn();
  });
  dirtyComputations.clear();
  recomputeTimeout = null;
};

var id = 0;
var toObservable = function toObservable(targetObj) {
  targetObj.__id__ = id++;
  // console.log(targetObj);
  var proxy = new Proxy(targetObj, {
    get: function get(target, key, receiver) {
      // console.log('!',target,key);
      if (key === "__target__") {
        return target;
      }
      if (key === "unobserve") {
        return function () {
          return unobserve(target);
        };
      }
      var result = Reflect.get(target, key, receiver);
      registerPropertyAccessToComputation(target, key);
      if (runningComputation && isObject(result)) {
        console.log("make nested:" + key.toString());
        var observableResult = observable(result);
        Reflect.set(target, key, observableResult, receiver);
        return observableResult;
      }
      //console.log(`Get ${key.toString()} = ${result}`);
      return result;
    },
    set: function set(target, key, value, receiver) {
      // console.log(`Set ${key.toString()} = ${value}`);
      checkRecomputationNeeded(target, key);
      var result = Reflect.set(target, key, value, receiver);
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

var isObject = function isObject(obj) {
  return obj === Object(obj);
};

// inside getter, on child property change, trigger dirty on self

exports.observable = observable;
exports.observe = observe;
exports.autorun = autorun;
exports.computed = computed;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam9icy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2pvYnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWNoZWNrXG5cbmNvbnN0IHRhcmdldFByb3BlcnR5VG9Db21wdXRlZCA9IG5ldyBNYXAoKTtcblxuY29uc3QgY29tcHV0ZWRzID0gbmV3IE1hcCgpO1xuXG5jb25zdCBkaXJ0eUNvbXB1dGF0aW9ucyA9IG5ldyBTZXQoKTtcblxubGV0IHJlY29tcHV0ZVRpbWVvdXQgPSBudWxsO1xubGV0IHJ1bm5pbmdDb21wdXRhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBjb25zdCBvYnNlcnZhYmxlID0gdGFyZ2V0ID0+IHtcbiAgcmV0dXJuIHRvT2JzZXJ2YWJsZSh0YXJnZXQpO1xufTtcblxuZXhwb3J0IGNvbnN0IG9ic2VydmUgPSAoKSA9PiB7fTtcblxuZXhwb3J0IGNvbnN0IHVub2JzZXJ2ZSA9ICh0YXJnZXQpID0+IHtcbiAgY29uc29sZS5sb2coXCJUb0RvXCIpO1xuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5leHBvcnQgY29uc3QgYXV0b3J1biA9IChmbixuYW1lPVwidW5rbm93blwiKSA9PiB7XG4gIGNvbnN0IG9ic2VydmVyID0ge2ZuLG5hbWV9O1xuICBjb21wdXRlZHMuc2V0KGZuLCBvYnNlcnZlcik7XG4gIHJldHVybiBydW5Db21wdXRlZChvYnNlcnZlcik7XG59O1xuXG52YXIgbG9nZ2VyID0gbSA9PiBjb25zb2xlLmxvZyhtKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVkKHRhcmdldCwga2V5LCBkZXNjcmlwdG9yKSB7XG4gIHJldHVybiBkZXNjcmlwdG9yO1xufVxuXG5jb25zdCBydW5Db21wdXRlZCA9IG9ic2VydmVyID0+IHtcbiAgcnVubmluZ0NvbXB1dGF0aW9uID0gb2JzZXJ2ZXI7XG4gIGNvbnN0IHJlc3VsdCA9IG9ic2VydmVyLmZuKCk7XG4gIHJ1bm5pbmdDb21wdXRhdGlvbiA9IG51bGw7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKlxuICogQ2FsbGVkIHdoZW5ldmVyIGEgcHJvcGVydHkgaXMgYWNjZXNzZWQgb24gYW4gb2JzZXJ2YWJsZVxuICovXG5cbmNvbnN0IHJlZ2lzdGVyUHJvcGVydHlBY2Nlc3NUb0NvbXB1dGF0aW9uID0gKHRhcmdldCwga2V5KSA9PiB7XG4gIGlmIChydW5uaW5nQ29tcHV0YXRpb24pIHtcbiAgICBjb25zdCB0YXJnZXRPYmogPSB0YXJnZXRQcm9wZXJ0eVRvQ29tcHV0ZWQuZ2V0KHRhcmdldCk7XG4gICAgbGV0IHByb3BlcnR5U2V0ID0gdGFyZ2V0T2JqLmdldChrZXkpO1xuICAgIGlmICghcHJvcGVydHlTZXQpIHtcbiAgICAgIHByb3BlcnR5U2V0ID0gbmV3IFNldCgpO1xuICAgICAgdGFyZ2V0T2JqLnNldChrZXkscHJvcGVydHlTZXQpO1xuICAgIH1cbiAgICBwcm9wZXJ0eVNldC5hZGQocnVubmluZ0NvbXB1dGF0aW9uKTtcbiAgICBjb25zb2xlLmxvZyh0YXJnZXRPYmopOyAgICBcbiAgfVxufTtcblxuY29uc3QgY2hlY2tSZWNvbXB1dGF0aW9uTmVlZGVkID0gKHRhcmdldCwga2V5KSA9PiB7XG4gIC8vIGNvbnNvbGUubG9nKCdjaGVja2luZy4uLicpO1xuICBjb25zdCBjb21wdXRhdGlvbnMgPSB0YXJnZXRQcm9wZXJ0eVRvQ29tcHV0ZWQuZ2V0KHRhcmdldCkuZ2V0KGtleSk7XG4gIC8vIGNvbnNvbGUubG9nKGNvbXB1dGF0aW9ucyk7XG4gIGlmIChjb21wdXRhdGlvbnMpIHtcbiAgICBjb21wdXRhdGlvbnMuZm9yRWFjaChkaXJ0eUNvbXB1dGF0aW9ucy5hZGQsZGlydHlDb21wdXRhdGlvbnMpO1xuICAgIGlmIChyZWNvbXB1dGVUaW1lb3V0ID09IG51bGwpXG4gICAgICByZWNvbXB1dGVUaW1lb3V0ID0gc2V0VGltZW91dChyZWNvbXB1dGVDb21wdXRhdGlvbnMsIDApO1xuICB9XG59O1xuXG4vKlxuICogUmVydW4gYWxsICdkaXJ0eScgY29tcHV0YXRpb25zXG4gKi9cbmNvbnN0IHJlY29tcHV0ZUNvbXB1dGF0aW9ucyA9ICgpID0+IHtcbiAgZGlydHlDb21wdXRhdGlvbnMuZm9yRWFjaChvYnNlcnZlciA9PiBvYnNlcnZlci5mbigpKTtcbiAgZGlydHlDb21wdXRhdGlvbnMuY2xlYXIoKTtcbiAgcmVjb21wdXRlVGltZW91dCA9IG51bGw7XG59O1xuXG5sZXQgaWQgPSAwO1xuY29uc3QgdG9PYnNlcnZhYmxlID0gdGFyZ2V0T2JqID0+IHtcbiAgdGFyZ2V0T2JqLl9faWRfXyA9IGlkKys7XG4gIC8vIGNvbnNvbGUubG9nKHRhcmdldE9iaik7XG4gIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KHRhcmdldE9iaiwge1xuICAgIGdldDogKHRhcmdldCwga2V5LCByZWNlaXZlcikgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coJyEnLHRhcmdldCxrZXkpO1xuICAgICAgaWYgKGtleSA9PT0gXCJfX3RhcmdldF9fXCIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09IFwidW5vYnNlcnZlXCIpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHVub2JzZXJ2ZSh0YXJnZXQpO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICAgIGlmIChyZXN1bHQgJiYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkuZ2V0KSB7XG4gICAgICAgIC8vVE9ETyBoYW5kbGUgdGhpcz9cbiAgICAgIH1cbiAgICAgIHJlZ2lzdGVyUHJvcGVydHlBY2Nlc3NUb0NvbXB1dGF0aW9uKHRhcmdldCwga2V5KTtcbiAgICAgIGlmIChydW5uaW5nQ29tcHV0YXRpb24gJiYgaXNPYmplY3QocmVzdWx0KSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1ha2UgbmVzdGVkOlwiK2tleS50b1N0cmluZygpKTtcbiAgICAgICAgY29uc3Qgb2JzZXJ2YWJsZVJlc3VsdCA9IG9ic2VydmFibGUocmVzdWx0KTtcbiAgICAgICAgUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIG9ic2VydmFibGVSZXN1bHQsIHJlY2VpdmVyKTtcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGVSZXN1bHRcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coYEdldCAke2tleS50b1N0cmluZygpfSA9ICR7cmVzdWx0fWApO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIHNldDogKHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGBTZXQgJHtrZXkudG9TdHJpbmcoKX0gPSAke3ZhbHVlfWApO1xuICAgICAgY2hlY2tSZWNvbXB1dGF0aW9uTmVlZGVkKHRhcmdldCwga2V5KTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3Quc2V0KHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgICAgLy8gY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIC8vICxhcHBseTogKHRhcmdldCwgdGhpc0FyZywgYXJndW1lbnRzTGlzdCkgPT4ge1xuICAgIC8vICAgY29uc29sZS5sb2coXCIhISB0YXJnZXRcIik7XG4gICAgLy8gICAvLyBpZiAodGFyZ2V0ID09PSBcInVub2JzZXJ2ZVwiKSB7XG4gICAgLy8gICAvLyAgIHJldHVybiB1bm9ic2VydmUodGFyZ2V0Ll9fdGFyZ2V0X18pO1xuICAgIC8vICAgLy8gfVxuICAgIC8vIH1cbiAgfSk7XG4gIHRhcmdldFByb3BlcnR5VG9Db21wdXRlZC5zZXQodGFyZ2V0T2JqLCBuZXcgTWFwKCkpO1xuICByZXR1cm4gcHJveHk7XG59O1xuXG5jb25zdCBpdGVyYXRlT2JqZWN0R3JhcGggPSBub2RlID0+IHtcbiAgaWYgKGlzQXJyYXkobm9kZSkpIHtcbiAgfSBlbHNlIGlmIChpc09iamVjdChub2RlKSkge1xuICB9XG59O1xuXG5jb25zdCBpc0FycmF5ID0gb2JqID0+IEFycmF5LmlzQXJyYXk7XG5jb25zdCBpc09iamVjdCA9IG9iaiA9PiBvYmogPT09IE9iamVjdChvYmopO1xuXG4vLyBpbnNpZGUgZ2V0dGVyLCBvbiBjaGlsZCBwcm9wZXJ0eSBjaGFuZ2UsIHRyaWdnZXIgZGlydHkgb24gc2VsZiJdLCJuYW1lcyI6WyJ0YXJnZXRQcm9wZXJ0eVRvQ29tcHV0ZWQiLCJNYXAiLCJjb21wdXRlZHMiLCJkaXJ0eUNvbXB1dGF0aW9ucyIsIlNldCIsInJlY29tcHV0ZVRpbWVvdXQiLCJydW5uaW5nQ29tcHV0YXRpb24iLCJvYnNlcnZhYmxlIiwidG9PYnNlcnZhYmxlIiwidGFyZ2V0Iiwib2JzZXJ2ZSIsInVub2JzZXJ2ZSIsImxvZyIsImF1dG9ydW4iLCJmbiIsIm5hbWUiLCJvYnNlcnZlciIsInNldCIsInJ1bkNvbXB1dGVkIiwiY29tcHV0ZWQiLCJrZXkiLCJkZXNjcmlwdG9yIiwicmVzdWx0IiwicmVnaXN0ZXJQcm9wZXJ0eUFjY2Vzc1RvQ29tcHV0YXRpb24iLCJ0YXJnZXRPYmoiLCJnZXQiLCJwcm9wZXJ0eVNldCIsImFkZCIsImNoZWNrUmVjb21wdXRhdGlvbk5lZWRlZCIsImNvbXB1dGF0aW9ucyIsImZvckVhY2giLCJzZXRUaW1lb3V0IiwicmVjb21wdXRlQ29tcHV0YXRpb25zIiwiY2xlYXIiLCJpZCIsIl9faWRfXyIsInByb3h5IiwiUHJveHkiLCJyZWNlaXZlciIsIlJlZmxlY3QiLCJpc09iamVjdCIsInRvU3RyaW5nIiwib2JzZXJ2YWJsZVJlc3VsdCIsInZhbHVlIiwib2JqIiwiT2JqZWN0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7O0FBRUEsSUFBTUEsMkJBQTJCLElBQUlDLEdBQUosRUFBakM7O0FBRUEsSUFBTUMsWUFBWSxJQUFJRCxHQUFKLEVBQWxCOztBQUVBLElBQU1FLG9CQUFvQixJQUFJQyxHQUFKLEVBQTFCOztBQUVBLElBQUlDLG1CQUFtQixJQUF2QjtBQUNBLElBQUlDLHFCQUFxQixJQUF6Qjs7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
