module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    exclude: ['build/test/external.spec.js'],

    files: [
      'vendor/rsvp.js',
      'vendor/unexpected-magicpen.min.js',
      'build/test/promisePolyfill.js',
      'unexpected.js',
      'build/test/common.js',
      'build/test/**/*.spec.js',
    ],

    browsers: ['ChromeHeadlessNoSandbox', 'ie11'],

    browserDisconnectTimeout: '360000',
    browserNoActivityTimeout: '360000',

    client: {
      mocha: {
        reporter: 'html',
        timeout: 360000,
      },
    },

    browserStack: {
      video: false,
      project:
        process.env.GITHUB_REF === 'refs/heads/master' &&
        !process.env.GITHUB_HEAD_REF // Catch "PR" builds
          ? 'unexpected'
          : 'unexpected-dev',
      // Attempt to fix timeouts on CI:
      // https://github.com/karma-runner/karma-browserstack-launcher/pull/168#issuecomment-582373514
      timeout: 1800,
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
      ie11: {
        base: 'BrowserStack',
        browser: 'IE',
        browser_version: '11',
        os: 'Windows',
        os_version: '7',
      },
    },

    reporters: ['dots', 'BrowserStack'],
  });
};
