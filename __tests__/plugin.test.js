const plugin = require('../src/plugin');
const {transformFileSync} = require('babel-core');
const path = require('path');

const defaultBabelOptions = {
  babelrc: false
};

const fixturesDir = path.join(__dirname, '__fixtures__');

describe('plugin', () => {
  it('removes standalone HMR test if-clauses', () => {
    const output = transformFixture('remove-standalone-if');
    expect(output.code).toMatchSnapshot();
  });

  it('extracts else-statements following HMR test if-clauses', () => {
    const output = transformFixture('extract-following-else');
    expect(output.code).toMatchSnapshot();
  });

  it('extracts else-if-statements following HMR test if-clauses', () => {
    const output = transformFixture('extract-following-else-if');
    expect(output.code).toMatchSnapshot();
  });

  it('combines if-clauses surrounding HMR test if-statements', () => {
    const output = transformFixture('combine-surrounding-if');
    expect(output.code).toMatchSnapshot();
  });

  it('ignores other properties of the HMR object', () => {
    const output = transformFixture('ignore-other-object-properties');
    expect(output.code).toMatchSnapshot();
  });

  it('ignores other objects', () => {
    const output = transformFixture('ignore-other-objects');
    expect(output.code).toMatchSnapshot();
  });

  it('ignores negated HMR tests', () => {
    const output = transformFixture('ignore-negated-tests');
    expect(output.code).toMatchSnapshot();
  });

  it('ignores local variable bindings', () => {
    const output = transformFixture('ignore-local-variables');
    expect(output.code).toMatchSnapshot();
  });

  it('allows customizing object and property names', () => {
    const output = transformFixture('use-custom-names', {
      objectName: 'customObjectName',
      propertyName: 'customPropertyName'
    });
    expect(output.code).toMatchSnapshot();
  });
});

function transformFixture(fixtureName, pluginOptions = {}) {
  const fixturePath = getFixturePath(fixtureName);
  const options = Object.assign({}, defaultBabelOptions, {
    plugins: [
      [plugin, pluginOptions]
    ]
  });

  return transformFileSync(fixturePath, options);
}

function getFixturePath(name) {
  return path.join(fixturesDir, `${name}.js`);
}

