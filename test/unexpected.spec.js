/*global describe, it, expect*/

// use this instead of Object.create in order to make the tests run in
// es5 compatible browsers
function create(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

describe('unexpected', function () {
    describe('ok/truthy/falsy assertion', function () {
        it('assert that the value is truthy or not', function () {
            expect(1, 'to be ok');
            expect(true, 'to be ok');
            expect(true, 'not to be falsy');
            expect({}, 'to be truthy');
            expect(0, 'not to be ok');
            expect(0, 'to be falsy');
            expect(null, 'to be falsy');
            expect(undefined, 'to be falsy');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be ok');
            }, 'to throw exception', 'expected 0 to be ok');
        });

        it('throws with message when the assertion fails', function () {
            expect(function () {
                expect(4 < 4, 'to be ok', '4 < 4');
            }, "to throw exception", "expected false to be ok '4 < 4'");
        });

        it('throws with a stack trace that has the calling function as the top frame when the assertion fails (if the environment supports it)', function () {
            if (Error.captureStackTrace || 'stack' in new Error()) {
                expect(function TheCallingFunction() {
                    expect(4 < 4, 'to be ok');
                }, 'to throw exception', function (err) {
                    expect(err.stack.split('\n')[1], 'to match', /TheCallingFunction/);
                });
            }
        });
    });

    describe('be assertion', function () {
        it('assert === equality', function () {
            var obj = {};
            expect(obj, 'to be', obj);
            expect(obj, 'not to be', {});
            expect(1, 'to be', 1);
            expect(NaN, 'not to be', NaN);
            expect(1, 'not to be', true);
            expect('1', 'not to be', 1);
            expect(null, 'not to be', undefined);
            expect(null, 'to be null');
            expect(0, 'not to be null');
            expect(undefined, 'not to be null');
            expect(undefined, 'to be undefined');
            if (typeof Buffer !== 'undefined') {
                var buffer = new Buffer([0x45, 0x59]);
                expect(buffer, 'to be', buffer);
            }
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('foo', 'to be', 'bar');
            }, 'to throw exception', "expected 'foo' to be 'bar'");

            expect(function () {
                expect(true, 'not to be', true);
            }, 'to throw exception', "expected true not to be true");
        });
    });

    describe('a/an assertion', function () {
        it('asserts typeof with support for array type and instanceof', function () {
            expect(5, 'to be a', 'number');
            expect(5, 'to be a number');
            expect([], 'to be an', 'array');
            expect([], 'to be an array');
            expect([], 'to be an', 'object');
            expect([], 'to be an object');
            expect([], 'to be an', Array);
            expect(/ab/, 'to be a', RegExp);
            expect(/ab/, 'to be a regexp');
            expect(123, 'not to be a regex');
            expect(/ab/, 'to be a regex');
            expect(/ab/, 'to be a regular expression');
            expect(123, 'not to be a regular expression');
            expect(null, 'not to be an', 'object');
            expect(null, 'not to be an object');
            expect(true, 'to be a', 'boolean');
            expect(true, 'to be a boolean');
            expect("".substring, 'to be a', 'function');
            expect("".substring, 'to be a function');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(5, 'to be a', Array);
            }, 'to throw exception', /expected 5 to be a \[Function(: Array)?\]/);

            expect(function () {
                expect([], 'not to be an', 'array');
            }, 'to throw exception', "expected [] not to be an 'array'");
        });
    });

    describe('equal assertion', function () {
        it('asserts loose equality that works with objects', function () {
            expect({ a: 'b' }, 'to equal', { a: 'b' });
            expect(1, 'to equal', '1');
            expect(1, 'to equal', 1);
            expect(null, 'not to equal', '1');
            var now = new Date();
            expect(now, 'to equal', now);
            expect(now, 'to equal', new Date(now.getTime()));
            expect({ now: now }, 'to equal', { now: now });
            expect(null, 'to equal', null);
            expect(null, 'not to equal', undefined);
            expect(undefined, 'to equal', undefined);
            expect(true, 'to equal', true);
            expect(false, 'to equal', false);
            expect({ a: { b: 'c' } }, 'to equal', { a: { b: 'c' } });
            expect({ a: { b: 'c' } }, 'not to equal', { a: { b: 'd' } });
            expect(/foo/, 'to equal', /foo/);
            expect(/foo/i, 'not to equal', /foo/);
            expect(/foo/gm, 'to equal', /foo/gm);
            expect(/foo/m, 'not to equal', /foo/i);
            expect(/foo/m, 'to equal', new RegExp('foo', 'm'));
            if (typeof Buffer !== 'undefined') {
                expect(new Buffer([0x45, 0x59]), 'to equal', new Buffer([0x45, 0x59]));
            }
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({ a: { b: 'c'} }, 'to equal', { a: { b: 'd'} });
            }, 'to throw exception', "expected { a: { b: 'c' } } to equal { a: { b: 'd' } }");

            expect(function () {
                expect({ a: 'b' }, 'not to equal', { a: 'b' });
            }, 'to throw exception', "expected { a: 'b' } not to equal { a: 'b' }");
        });

        it("throws an error with 'expected' and 'actual' properties when not negated", function () {
            var expected = 123,
                actual = 456;
            expect(function () {
                expect(actual, 'to equal', expected);
            }, 'to throw exception', function (e) {
                expect(e.expected, 'to equal', expected);
                expect(e.actual, 'to equal', actual);
            });
        });

        it("throws an error without 'expected' and 'actual' properties when negated", function () {
            expect(function () {
                expect(123, 'not to equal', 123);
            }, 'to throw exception', function (e) {
                expect(e.expected, 'not to be ok');
                expect(e.actual, 'not to be ok');
            });
        });
    });

    describe('exception assertion', function () {
        it('fails if no exception is thrown', function () {
            expect(function () {
                expect(function () {
                    // Don't throw
                }, 'to throw exception');
            }, 'to throw', 'expected [Function] to throw exception');
        });

        it('fails if the argument is not a function', function () {
            expect(function () {
                expect(1, 'to throw exception');
            }, 'to throw exception', "Assertion 'to throw exception' only supports functions");
        });

        it('given a function the function is called with the exception', function () {
            expect(function () {
                throw new SyntaxError();
            }, 'to throw exception', function (e) {
                expect(e, 'to be a', SyntaxError);
            });
        });

        it('matches the message against the given regular expression', function () {
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to throw exception', /matches the exception message/);
            expect(function () {
                throw new Error('Other error');
            }, 'not to throw exception', /matches the exception message/);
        });

        it('exactly matches the message against the given string', function () {
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to throw exception', 'matches the exception message');
            expect(function () {
                throw new Error('matches the exception message');
            }, 'not to throw exception', 'the exception message');
        });
    });

    describe('match assertion', function () {
        it('tests that the subject matches the given regular expression', function () {
            expect('test', 'to match', /.*st/);
            expect('test', 'not to match', /foo/);
            expect(null, 'not to match', /foo/);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('test', 'to match', /foo/);
            }, 'to throw exception', "expected 'test' to match /foo/");
        });
    });

    describe('contain assertion', function () {
        it('asserts indexOf for an array or string', function () {
            expect([1, 2], 'to contain', 1);
            expect([1, 2], 'to contain', 2, 1);
            expect('hello world', 'to contain', 'world');
            expect(null, 'not to contain', 'world');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('hello world', 'to contain', 'foo');
            }, 'to throw exception', "expected 'hello world' to contain 'foo'");

            expect(function () {
                expect('hello world', 'to contain', 'hello', 'foo');
            }, 'to throw exception', "expected 'hello world' to contain 'hello', 'foo'");

            expect(function () {
                expect([1, 2], 'to contain', 2, 3);
            }, 'to throw exception', "expected [ 1, 2 ] to contain 2, 3");

            expect(function () {
                expect(1, 'to contain', 1);
            }, 'to throw exception', "Assertion 'to contain' only supports strings and arrays");
        });
    });

    describe('length assertion', function () {
        it('asserts array .length', function () {
            expect([], 'to have length', 0);
            expect([1,2,3], 'to have length', 3);
            expect([1,2,3], 'not to have length', 4);
            expect({ length: 4 }, 'to have length', 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect([1, 2], 'to have length', 3);
            }, 'to throw exception', "expected [ 1, 2 ] to have length 3");

            expect(function () {
                expect(null, 'to have length', 4);
            }, 'to throw exception', "Assertion 'to have length' only supports array like objects");

            expect(function () {
                expect({ length: 'foo' }, 'to have length', 4);
            }, 'to throw exception', "Assertion 'to have length' only supports array like objects");
        });
    });

    describe('property assertion', function () {
        it('asserts presence of an own property (and value optionally)', function () {
            expect([1, 2], 'to have property', 'length');
            expect([1, 2], 'to have property', 'length', 2);
            expect({a: 'b'}, 'to have property', 'a');
            expect({a: 'b'}, 'to have property', 'a', 'b');
            expect({a: 'b'}, 'to have property', 'toString');
            expect({a: 'b'}, 'not to have property', 'b');
            expect({a: 'b'}, 'to have own property', 'a');
            expect(create({a: 'b'}), 'not to have own property', 'a');
            expect(1, 'not to have property', 'a');
            expect(null, 'not to have property', 'a');
            expect(undefined, 'not to have property', 'a');
            expect(true, 'not to have property', 'a');
            expect(false, 'not to have property', 'a');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({a: 'b'}, 'to have property', 'b');
            }, 'to throw exception', "expected { a: 'b' } to have property 'b'");

            expect(function () {
                expect(null, 'to have property', 'b');
            }, 'to throw exception', "expected null to have property 'b'");

            expect(function () {
                expect({a: 'b'}, 'to have property', 'a', 'c');
            }, 'to throw exception', "expected { a: 'b' } to have property 'a', 'c'");

            expect(function () {
                // property expectations on value expects the property to be present
                expect(null, 'not to have property', 'a', 'b');
            }, 'to throw exception', "expected null not to have property 'a', 'b'");

            expect(function () {
                // property expectations on value expects the property to be present
                expect(null, 'not to have own property', 'a', 'b');
            }, 'to throw exception', "expected null not to have own property 'a', 'b'");
        });
    });

    describe('empty assertion', function () {
        it('asserts presence of an own property (and value optionally)', function () {
            expect([], 'to be empty');
            expect('', 'to be empty');
            expect({}, 'to be empty');
            expect({ length: 0, duck: 'typing' }, 'to be empty');
            expect({ my: 'object' }, 'not to be empty');
            expect([1,2,3], 'not to be empty');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect([1,2,3], 'to be empty');
            }, 'to throw exception', "expected [ 1, 2, 3 ] to be empty");

            expect(function () {
                expect(null, 'to be empty');
            }, 'to throw exception', "Assertion 'to be empty' only supports strings, arrays and objects");
        });
    });

    describe('key assertion', function () {
        it('asserts the presence of a key', function () {
            expect({ a: 'b' }, 'to have key', 'a');
            expect({ a: 'b' }, 'not to have key', 'b');
            expect({ a: 'b', c: 'd' }, 'to not only have key', 'a');
            expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'c');
            expect({ a: 'b', c: 'd' }, 'to only have keys', ['a', 'c']);
            expect({ a: 'b', c: 'd', e: 'f' }, 'to not only have keys', ['a', 'c']);
            expect(null, 'not to have key', 'a');
            expect(undefined, 'not to have key', 'a');
            expect(true, 'not to have key', 'a');
            expect(false, 'not to have key', 'a');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({ a: 'b', b: 'c' }, 'to have key', 'e');
            }, 'to throw exception', "expected { a: 'b', b: 'c' } to have key 'e'");

            expect(function () {
                expect({ a: 'b', b: 'c' }, 'to only have key', 'b');
            }, 'to throw exception', "expected { a: 'b', b: 'c' } to only have key 'b'");

            expect(function () {
                expect({ a: 'b', b: 'c' }, 'not to have key', 'b');
            }, 'to throw exception', "expected { a: 'b', b: 'c' } not to have key 'b'");

            expect(function () {
                expect({ a: 'b', c: 'd' }, 'to not only have keys', ['a', 'c']);
            }, 'to throw exception', "expected { a: 'b', c: 'd' } to not only have keys [ 'a', 'c' ]");

            expect(function () {
                expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'd');
            }, 'to throw exception', "expected { a: 'b', c: 'd' } to only have keys 'a', 'd'");

            expect(function () {
                expect({ a: 'b', c: 'd' }, 'to not only have keys', 'a', 'c');
            }, 'to throw exception', "expected { a: 'b', c: 'd' } to not only have keys 'a', 'c'");
        });
    });

    describe('finite assertion', function () {
        it('asserts a finite number', function () {
            expect(123, 'to be finite');
            expect(0, 'to be finite');
            expect(Infinity, 'not to be finite');
            expect(-Infinity, 'not to be finite');
            expect(NaN, 'not to be finite');
            expect(null, 'not to be finite');
            expect({}, 'not to be finite');

            it('throws when the assertion fails', function () {
                expect(function () {
                    expect(Infinity, 'to be finite');
                }, 'to throw exception', 'expected Infinity to be finite');
            });
        });
    });

    describe('finite assertion', function () {
        it('asserts a infinite number', function () {
            expect(123, 'not to be infinite');
            expect(0, 'not to be infinite');
            expect(Infinity, 'to be infinite');
            expect(-Infinity, 'to be infinite');
            expect(NaN, 'not to be infinite');
            expect(null, 'not to be infinite');
            expect({}, 'not to be infinite');

            it('throws when the assertion fails', function () {
                expect(function () {
                    expect(123, 'to be finite');
                }, 'to throw exception', 'expected 123 to be infinite');
            });
        });
    });

    describe('within assertion', function () {
        it('asserts a number within a range', function () {
            expect(0, 'to be within', 0, 4);
            expect(1, 'to be within', 0, 4);
            expect(4, 'to be within', 0, 4);
            expect(-1, 'not to be within', 0, 4);
            expect(5, 'not to be within', 0, 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(4, 'not to be within', 0, 4);
            }, 'to throw exception', "expected 4 not to be within '0..4'");
            expect(function () {
                expect(null, 'not to be within', 0, 4);
            }, 'to throw exception', "expected null not to be within '0..4'");
        });
    });

    describe('less than assertion', function () {
        it('asserts <', function () {
            expect(0, 'to be less than', 4);
            expect(0, 'to be below', 1);
            expect(3, 'to be <', 4);
            expect(3, '<', 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be less than', 0);
            }, 'to throw exception', "expected 0 to be less than 0");
        });
    });

    describe('less than or equal assertion', function () {
        it('asserts <=', function () {
            expect(0, 'to be less than or equal to', 4);
            expect(4, 'to be <=', 4);
            expect(3, '<=', 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be less than or equal to', -1);
            }, 'to throw exception', "expected 0 to be less than or equal to -1");
        });
    });

    describe('greater than assertion', function () {
        it('assert >', function () {
            expect(3, 'to be greater than', 2);
            expect(1, 'to be above', 0);
            expect(4, 'to be >', 3);
            expect(4, '>', 3);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be greater than', 0);
            }, 'to throw exception', "expected 0 to be greater than 0");
        });
    });

    describe('greater than or equal assertion', function () {
        it('assert >=', function () {
            expect(3, 'to be greater than or equal to', 2);
            expect(3, 'to be >=', 3);
            expect(3, '>=', 3);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(-1, 'to be greater than or equal to', 0);
            }, 'to throw exception', "expected -1 to be greater than or equal to 0");
        });
    });

    describe('positive assertion', function () {
        it('assert that a number is positive', function () {
            expect(3, 'to be positive');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be positive');
            }, 'to throw exception', "expected 0 to be positive");
        });
    });

    describe('negative assertion', function () {
        it('assert that a number is negative', function () {
            expect(-1, 'to be negative');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be negative');
            }, 'to throw exception', "expected 0 to be negative");
        });
    });

    describe('fail assertion', function () {
        it('throws an error', function () {
            expect(function () {
                expect.fail();
            }, 'to throw exception', "explicit failure");
        });

        it('throws an error with a given message', function () {
            expect(function () {
                expect.fail('fail with error message');
            }, 'to throw exception', "fail with error message");
        });

        it('supports placeholders', function () {
            expect(function () {
                expect.fail('{0} was expected to be {1}', 0, 'zero');
            }, 'to throw exception', "0 was expected to be 'zero'");

            expect(function () {
                expect.fail('{0} was expected to be {1}', 0);
            }, 'to throw exception', "0 was expected to be {1}");
        });

        it('throws if the assertion does not exists', function () {
            expect(function () {
                expect(1, "foo bar", 2);
            }, 'to throw exception', 'Unknown assertion "foo bar", did you mean: "to be"');
        });
    });

    function sortBy(arr, property) {
        arr.sort(function (x, y) {
            var xp = x[property];
            var yp = y[property];
            if (xp > yp) { return 1; }
            if (xp < yp) { return -1; }
            return 0;
        });
    }

    describe('internal', function () {
        describe('expandPattern', function () {
            it('expands patterns containing multiple flags', function () {
                var expanded = expect.internal.expandPattern('foo [not] [only] bar');
                sortBy(expanded, 'text');

                expect(expanded, 'to equal', [
                    { text: 'foo bar', flags: []},
                    { text: 'foo not bar', flags: ['not']},
                    { text: 'foo not only bar', flags: ['not', 'only']},
                    { text: 'foo only bar', flags: ['only']}
                ]);
                expect(expanded.length, 'to be', 4);
            });
            it('expands patterns alternations', function () {
                var expanded = expect.internal.expandPattern('foo (bar|bar baz) (qux|quux)');
                sortBy(expanded, 'text');

                expect(expanded, 'to equal', [
                    { text: 'foo bar baz quux', flags: []},
                    { text: 'foo bar baz qux', flags: []},
                    { text: 'foo bar quux', flags: []},
                    { text: 'foo bar qux', flags: []}
                ]);
                expect(expanded.length, 'to be', 4);
            });
        });
    });
});
