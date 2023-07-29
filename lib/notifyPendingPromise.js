/* global jasmine, expect */
let pendingPromisesForTheCurrentTest = [];
let afterEachRegistered = false;

let currentSpec = null;

if (typeof jasmine === 'object') {
  // Add a custom reporter that allows us to capture the name of the currently executing spec:
  jasmine.getEnv().addReporter({
    specStarted(spec) {
      currentSpec = spec;
    },
    specDone(spec) {
      currentSpec = null;
    },
  });
}

function isPendingOrHasUnhandledRejection(promise) {
  return (
    !promise._fulfillmentHandler0 &&
    !promise._rejectionHandler0 &&
    !promise._receiver0 &&
    (promise.isPending() || (promise.isRejected() && promise.reason().uncaught))
  );
}

function registerAfterEachHook() {
  if (typeof afterEach === 'function' && !afterEachRegistered) {
    afterEachRegistered = true;
    try {
      if (
        typeof expect === 'function' &&
        typeof expect.getState === 'function' &&
        typeof expect.getState().currentTestName !== 'string'
      ) {
        // Prevent triggering this error in jest 27+ when a test happens to be running and we didn't get to register the afterEach early:
        // Hooks cannot be defined inside tests. Hook of type "afterEach" is nested within "should correctly fetch keys in the absence of symbol support".
        return;
      }
      afterEach(function () {
        let error;
        let testPassed = true;
        if (
          pendingPromisesForTheCurrentTest.some(
            isPendingOrHasUnhandledRejection
          )
        ) {
          let displayName;
          if (this.currentTest) {
            // mocha
            testPassed = this.currentTest.state === 'passed';
            displayName = this.currentTest.title;
          } else if (currentSpec && typeof currentSpec === 'object') {
            testPassed = currentSpec.failedExpectations.length === 0;
            displayName = currentSpec.fullName;
          } else if (
            typeof expect === 'function' &&
            typeof expect.getState === 'function'
          ) {
            // Jest's global expect
            // https://stackoverflow.com/questions/52788380/get-the-current-test-spec-name-in-jest
            testPassed = undefined; // Jest 27+ doesn't expose whether the test passed or failed
            displayName = expect.getState().currentTestName;
          }
          error = new Error(
            `${displayName}: You have created a promise that was not returned from the it block`
          );
        }
        pendingPromisesForTheCurrentTest = [];
        if (error && testPassed !== false) {
          throw error;
        }
      });
    } catch (e) {
      // The benchmark suite fails when attempting to add an afterEach
    }
  }
}

// When running in jasmine/node.js or jest, afterEach is available immediately,
// but doesn't work within the it block. Register the hook immediately:
registerAfterEachHook();

module.exports = function notifyPendingPromise(promise) {
  pendingPromisesForTheCurrentTest.push(promise);
  // Register the afterEach hook lazily (mocha/node.js):
  registerAfterEachHook();
};
