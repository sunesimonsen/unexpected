/*global namespace*/
(function () {
    var shim = namespace.shim;
    var getKeys = shim.getKeys;

    var utils = namespace.utils;
    var isRegExp = utils.isRegExp;
    var isArguments = utils.isArguments;
    var isUndefinedOrNull = utils.isUndefinedOrNull;

    /**
     * Asserts deep equality
     *
     * @see taken from node.js `assert` module (copyright Joyent, MIT license)
     */
    function equal(actual, expected) {
        // 7.1. All identical values are equivalent, as determined by ===.
        if (actual === expected) {
            return true;
        } else if ('undefined' !== typeof Buffer &&
                   Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
            if (actual.length !== expected.length) return false;

            for (var i = 0; i < actual.length; i += 1) {
                if (actual[i] !== expected[i]) return false;
            }

            return true;

            // 7.2. If the expected value is a Date object, the actual value is
            // equivalent if it is also a Date object that refers to the same time.
        } else if (actual instanceof Date && expected instanceof Date) {
            return actual.getTime() === expected.getTime();

            // 7.3. Other pairs that do not both pass typeof value == "object",
            // equivalence is determined by ==.
        } else if (typeof actual !== 'object' && typeof expected !== 'object') {
            return actual === expected;

            // 7.4. For all other Object pairs, including Array objects, equivalence is
            // determined by having the same number of owned properties (as verified
            // with Object.prototype.hasOwnProperty.call), the same set of keys
            // (although not necessarily the same order), equivalent values using === for every
            // corresponding key, and an identical "prototype" property. Note: this
            // accounts for both named and indexed properties on Arrays.
        } else {
            return objEquiv(actual, expected);
        }
    }

    function objEquiv(a, b) {
        if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
            return false;
        // an identical "prototype" property.
        if (a.prototype !== b.prototype) return false;
        //~~~I've managed to break Object.keys through screwy arguments passing.
        //   Converting to array solves the problem.
        if (isRegExp(a)) {
            if (!isRegExp(b)) {
                return false;
            }
            return a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
        }
        if (isArguments(a)) {
            if (!isArguments(b)) {
                return false;
            }
            a = Array.prototype.slice.call(a);
            b = Array.prototype.slice.call(b);
            return equal(a, b);
        }
        var ka, kb, key, i;
        try {
            ka = getKeys(a);
            kb = getKeys(b);
        } catch (e) {//happens when one is a string literal and the other isn't
            return false;
        }
        // having the same number of owned properties (keys incorporates hasOwnProperty)
        if (ka.length !== kb.length)
            return false;
        //the same set of keys (although not necessarily the same order),
        ka.sort();
        kb.sort();
        //~~~cheap key test
        for (i = ka.length - 1; i >= 0; i -= 1) {
            if (ka[i] !== kb[i])
                return false;
        }
        //equivalent values for every corresponding key, and
        //~~~possibly expensive deep test
        for (i = ka.length - 1; i >= 0; i -= 1) {
            key = ka[i];
            if (!equal(a[key], b[key]))
                return false;
        }
        return true;
    }

    namespace.equal = equal;
}());
