/* global expect */
const diff = require('diff');

const unifiedDiff = require('../lib/unifiedDiff');

describe('unifiedDiff', () => {
  it('should produce output with context', () => {
    const lhsString = ['foo', 'bar', 'baz', 'quux', 'xuuq', 'qxqx'].join('\n');
    const rhsString = ['foo', 'bar', 'baz', 'quuq', 'xuuq', 'qxqx'].join('\n');

    const changes = diff.diffLines(lhsString, rhsString);
    const output = [];
    unifiedDiff(changes, out => output.push(out));

    expect(output, 'to equal', [
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      ['-', 'quux'],
      ['+', 'quuq'],
      ['=', 'xuuq'],
      ['=', 'qxqx']
    ]);
  });

  it('should allow ending on a change', () => {
    const lhsString = ['foo', 'bar', 'baz', 'quux'].join('\n');
    const rhsString = ['foo', 'bar', 'baz', 'quuq'].join('\n');

    const changes = diff.diffLines(lhsString, rhsString);
    const output = [];
    unifiedDiff(changes, out => output.push(out));

    expect(output, 'to equal', [
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      ['-', 'quux'],
      ['+', 'quuq']
    ]);
  });

  it('should support multiple chunks', () => {
    const lhsString = [
      'foo',
      'bar',
      'baz',
      'quux',
      'xuuq',
      'qxqx',
      'foo',
      'bar',
      'baz',
      'quux',
      'xuuq',
      'qxqx'
    ].join('\n');
    const rhsString = [
      'foo',
      'bar',
      'baz',
      'quuq',
      'xuuq',
      'qxqx',
      'foo',
      'bar',
      'baz',
      'quuq',
      'xuuq',
      'qxqx'
    ].join('\n');

    const changes = diff.diffLines(lhsString, rhsString);
    const output = [];
    unifiedDiff(changes, out => output.push(out));

    expect(output, 'to equal', [
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      ['-', 'quux'],
      ['+', 'quuq'],
      ['=', 'xuuq'],
      ['=', 'qxqx'],
      ['=', 'foo'],
      ['~'],
      ['=', 'foo'],
      ['=', 'bar'],
      ['=', 'baz'],
      ['-', 'quux'],
      ['+', 'quuq'],
      ['=', 'xuuq'],
      ['=', 'qxqx']
    ]);
  });
});
