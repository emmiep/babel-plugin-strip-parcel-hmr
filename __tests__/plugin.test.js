const plugin = require('../src/plugin');
const {transformFileSync} = require('babel-core');
const path = require('path');

const defaultBabelOptions = {
  babelrc: false
};

const fixturesDir = path.join(__dirname, '__fixtures__');

describe('plugin', () => {
  let babelOptions;

  beforeEach(() => babelOptions = Object.assign({}, defaultBabelOptions, {
    plugins: [plugin]
  }));

  it('removes standalone HMR test if-clauses', () => {
    const fixture = fixturePath('remove-standalone-if');
    const output = transformFileSync(fixture, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('extracts else-statements following HMR test if-clauses', () => {
    const fixture = fixturePath('extract-following-else');
    const output = transformFileSync(fixture, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('extracts else-if-statements following HMR test if-clauses', () => {
    const fixture = fixturePath('extract-following-else-if');
    const output = transformFileSync(fixture, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('combines if-clauses surrounding HMR test if-statements', () => {
    const fixture = fixturePath('combine-surrounding-if');
    const output = transformFileSync(fixture, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('ignores other properties of the HMR object', () => {
    const fixture = fixturePath('ignore-other-object-properties');
    const output = transformFileSync(fixture, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('ignores other objects', () => {
    const fixture = fixturePath('ignore-other-objects');
    const output = transformFileSync(fixture, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('ignores negated HMR tests', () => {
    const fixture = fixturePath('ignore-negated-tests');
    const output = transformFileSync(fixture, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('ignores local variable bindings', () => {
    const fixture = fixturePath('ignore-local-variables');
    const output = transformFileSync(fixture, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('allows customizing object and property names', () => {
    babelOptions = {
      plugins: [
        [plugin, {
          objectName: 'customObjectName',
          propertyName: 'customPropertyName'
        }]
      ]
    };

    const fixture = fixturePath('use-custom-names');
    const output = transformFileSync(fixture, babelOptions);
    expect(output.code).toMatchSnapshot();
  });
});

function fixturePath(name) {
  return path.join(fixturesDir, `${name}.js`);
}

