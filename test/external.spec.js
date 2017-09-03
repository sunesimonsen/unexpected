/*global unexpected, jasmine*/
var expect = unexpected.clone();
if (typeof process === 'object') {
    if (typeof jasmine !== 'undefined') {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    }

    describe('invoked in a test via an external test runner', function () {
        var pathModule = require('path');
        var childProcess = require('child_process');
        var basePath = pathModule.resolve(__dirname, '..');
        var extend = require('../lib/utils').extend;
        describe('executed through mocha', function () {
            expect.addAssertion('<array|string> executed through mocha <object?>', function (expect, subject, env) {
                if (!Array.isArray(subject)) {
                    subject = [subject];
                }
                return expect.promise(function (run) {
                    childProcess.execFile(pathModule.resolve(basePath, 'node_modules', '.bin', 'mocha'), subject.map(function (fileName) {
                        return pathModule.resolve(basePath, 'externaltests', fileName + '.spec.js');
                    }), {
                        cwd: basePath,
                        env: extend({}, process.env, env || {})
                    }, run(function (err, stdout, stderr) {
                        return [err, stdout, stderr];
                    }));
                });
            });

            it('should report that a promise was created, but not returned by the it block', function () {
                return expect('forgotToReturnPendingPromiseFromSuccessfulItBlock', 'executed through mocha').spread(function (err, stdout, stderr) {
                    expect(stdout, 'to contain', 'Error: should call the callback: You have created a promise that was not returned from the it block');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should not report that a promise was created if the test already failed synchronously', function () {
                return expect('forgotToReturnPendingPromiseFromFailingItBlock', 'executed through mocha').spread(function (err, stdout, stderr) {
                    expect(stdout, 'not to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should trim unexpected plugins from the stack trace when the UNEXPECTED_FULL_TRACE environment variable is not set', function () {
                return expect('fullTrace', 'executed through mocha', { UNEXPECTED_FULL_TRACE: '' }).spread(function (err, stdout, stderr) {
                    expect(stdout, 'not to contain', 'node_modules/unexpected-bogus/');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should not trim unexpected plugins from the stack trace when the UNEXPECTED_FULL_TRACE environment variable is set', function () {
                return expect('fullTrace', 'executed through mocha', { UNEXPECTED_FULL_TRACE: 'yes' }).spread(function (err, stdout, stderr) {
                    expect(stdout, 'to contain', 'node_modules/unexpected-bogus/');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should accept an UNEXPECTED_DEPTH environment variable', function () {
                return expect('deepObject', 'executed through mocha', { UNEXPECTED_DEPTH: 6 }).spread(function (err, stdout, stderr) {
                    expect(err, 'to be falsy');
                });
            });

            it('should render a long stack trace for an async test', function () {
                return expect('failingAsync', 'executed through mocha').spread(function (err, stdout, stderr) {
                    expect(err, 'to be truthy');
                    expect(stdout, 'to contain', 'From previous event:');
                });
            });

            it('should fail when a promise failing in the next tick is created but not returned', function () {
                return expect('forgotToReturnPromiseRejectedInTheNextTick', 'executed through mocha').spread(function (err, stdout, stderr) {
                    expect(stdout, 'to contain', 'Error: should fail: You have created a promise that was not returned from the it block');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            describe('with a test suite spanning multiple files', function () {
                it('should report that a promise was created, but not returned by the it block in the first test', function () {
                    return expect(['forgotToReturnPendingPromiseFromSuccessfulItBlock', 'successful'], 'executed through mocha').spread(function (err, stdout, stderr) {
                        expect(stdout, 'to contain', 'Error: should call the callback: You have created a promise that was not returned from the it block');
                        expect(err, 'to satisfy', { code: 1 });
                    });
                });

                it('should report that a promise was created, but not returned by the it block in the second test', function () {
                    return expect(['successful', 'forgotToReturnPendingPromiseFromSuccessfulItBlock'], 'executed through mocha').spread(function (err, stdout, stderr) {
                        expect(stdout, 'to contain', 'Error: should call the callback: You have created a promise that was not returned from the it block');
                        expect(err, 'to satisfy', { code: 1 });
                    });
                });
            });

            describe('with an assertion that succeeds, but creates a promise that remains pending', function () {
                it('should pass', function () {
                    return expect('assertionSucceedsWhilePromiseIsPending', 'executed through mocha').spread(function (err, stdout, stderr) {
                        expect(stdout, 'not to contain', 'Error: should call the callback: You have created a promise that was not returned from the it block');
                        expect(err, 'to be falsy');
                    });
                });
            });

            it('should render the stack trace of the thrown error without any artifacts when "not to error" encounters an error', function () {
                return expect('notToErrorCaughtError', 'executed through mocha').spread(function (err, stdout, stderr) {
                    expect(err, 'to satisfy', { code: 1 });
                    expect(
                        stdout,
                        'to contain',
                        "not to error\n" +
                        "  returned promise rejected with: Error('argh')\n" +
                        "\n" +
                        "      at thisIsImportant"
                    );
                });
            });
        });

        describe('executed through jasmine', function () {
            expect.addAssertion('<string> executed through jasmine', function (expect, subject) {
                return expect.promise(function (run) {
                    childProcess.execFile(pathModule.resolve(__dirname, '..', 'node_modules', '.bin', 'jasmine'), {
                        cwd: basePath,
                        env: extend({}, process.env, {
                            JASMINE_CONFIG_PATH: 'externaltests/' + subject + '.jasmine.json'
                        })
                    }, run(function (err, stdout, stderr) {
                        return [err, stdout, stderr];
                    }));
                });
            });

            it('should report that a promise was created, but not returned by the it block when the test ', function () {
                return expect('forgotToReturnPendingPromiseFromSuccessfulItBlock', 'executed through jasmine').spread(function (err, stdout, stderr) {
                    expect(stdout, 'to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should not report that a promise was created if the test already failed synchronously', function () {
                return expect('forgotToReturnPendingPromiseFromFailingItBlock', 'executed through jasmine').spread(function (err, stdout, stderr) {
                    expect(stdout, 'not to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                    expect(err, 'to satisfy', { code: 1 });
                });
            });

            it('should render the stack trace of the thrown error without any artifacts when "not to error" encounters an error', function () {
                return expect('notToErrorCaughtError', 'executed through jasmine').spread(function (err, stdout, stderr) {
                    expect(err, 'to satisfy', { code: 1 });
                    expect(
                        stdout,
                        'to contain',
                        "    not to error\n" +
                        "      returned promise rejected with: Error('argh')\n" +
                        "    \n" +
                        "        at thisIsImportant"
                    );
                });
            });
        });

        // jest requires node.js 4 or above:
        if (!/^v[0123]\./.test(process.version)) {
            describe('executed through jest', function () {
                expect.addAssertion('<array|string> executed through jest <object?>', function (expect, subject, env) {
                    if (!Array.isArray(subject)) {
                        subject = [subject];
                    }
                    return expect.promise(function (run) {
                        childProcess.execFile(pathModule.resolve(basePath, 'node_modules', '.bin', 'jest'), [
                            '--config', pathModule.resolve(basePath, 'externaltests', 'jestconfig.json')
                        ].concat(subject.map(function (fileName) {
                            return pathModule.resolve(__dirname, '..', 'externaltests', fileName + '.spec.js');
                        })), {
                            cwd: basePath,
                            env: extend({}, process.env, env || {})
                        }, run(function (err, stdout, stderr) {
                            return [err, stdout, stderr];
                        }));
                    });
                });

                it('should report that a promise was created, but not returned by the it block', function () {
                    return expect('forgotToReturnPendingPromiseFromSuccessfulItBlock', 'executed through jest').spread(function (err, stdout, stderr) {
                        expect(stderr, 'to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                        expect(err, 'to satisfy', { code: 1 });
                    });
                });

                it('should not report that a promise was created if the test already failed synchronously', function () {
                    return expect('forgotToReturnPendingPromiseFromFailingItBlock', 'executed through jest').spread(function (err, stdout, stderr) {
                        expect(stderr, 'not to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                        expect(err, 'to satisfy', { code: 1 });
                    });
                });

                it('should trim unexpected plugins from the stack trace when the UNEXPECTED_FULL_TRACE environment variable is not set', function () {
                    return expect('fullTrace', 'executed through jest', { UNEXPECTED_FULL_TRACE: '' }).spread(function (err, stdout, stderr) {
                        expect(stderr, 'not to contain', 'node_modules/unexpected-bogus/');
                        expect(err, 'to satisfy', { code: 1 });
                    });
                });

                it('should not trim unexpected plugins from the stack trace when the UNEXPECTED_FULL_TRACE environment variable is set', function () {
                    return expect('fullTrace', 'executed through jest', { UNEXPECTED_FULL_TRACE: 'yes' }).spread(function (err, stdout, stderr) {
                        expect(stderr, 'to contain', 'node_modules/unexpected-bogus/');
                        expect(err, 'to satisfy', { code: 1 });
                    });
                });

                it('should accept an UNEXPECTED_DEPTH environment variable', function () {
                    return expect('deepObject', 'executed through jest', { UNEXPECTED_DEPTH: 6 }).spread(function (err, stdout, stderr) {
                        expect(err, 'to be falsy');
                    });
                });

                it('should render a long stack trace for an async test', function () {
                    return expect('failingAsync', 'executed through jest').spread(function (err, stdout, stderr) {
                        expect(err, 'to be truthy');
                        expect(stderr, 'to contain', 'From previous event:');
                    });
                });

                it('should fail when a promise failing in the next tick is created but not returned', function () {
                    return expect('forgotToReturnPromiseRejectedInTheNextTick', 'executed through jest').spread(function (err, stdout, stderr) {
                        expect(stderr, 'to contain', 'should fail: You have created a promise that was not returned from the it block');
                        expect(err, 'to satisfy', { code: 1 });
                    });
                });

                describe('with a test suite spanning multiple files', function () {
                    it('should report that a promise was created, but not returned by the it block in the first test', function () {
                        return expect(['forgotToReturnPendingPromiseFromSuccessfulItBlock', 'successful'], 'executed through jest').spread(function (err, stdout, stderr) {
                            expect(stderr, 'to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                            expect(err, 'to satisfy', { code: 1 });
                        });
                    });

                    it('should report that a promise was created, but not returned by the it block in the second test', function () {
                        return expect(['successful', 'forgotToReturnPendingPromiseFromSuccessfulItBlock'], 'executed through jest').spread(function (err, stdout, stderr) {
                            expect(stderr, 'to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                            expect(err, 'to satisfy', { code: 1 });
                        });
                    });
                });

                describe('with an assertion that succeeds, but creates a promise that remains pending', function () {
                    it('should pass', function () {
                        return expect('assertionSucceedsWhilePromiseIsPending', 'executed through jest').spread(function (err, stdout, stderr) {
                            expect(stderr, 'not to contain', 'should call the callback: You have created a promise that was not returned from the it block');
                            expect(err, 'to be falsy');
                        });
                    });
                });

                it('should render the stack trace of the thrown error without any artifacts when "not to error" encounters an error', function () {
                    return expect('notToErrorCaughtError', 'executed through jest').spread(function (err, stdout, stderr) {
                        expect(err, 'to satisfy', { code: 1 });
                        expect(
                            stderr,
                            'to contain',
                            "    not to error\n" +
                            "      returned promise rejected with: Error('argh')\n" +
                            "      \n" +
                            "      \n" +
                            "      at thisIsImportant"
                        );
                    });
                });
            });
        }
    });
}
