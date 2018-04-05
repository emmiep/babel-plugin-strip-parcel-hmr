const plugin = require('../src/plugin');
const {transformFile} = require('babel-core');
const path = require('path');

const defaultBabelOptions = {
  babelrc: false
};

const fixturesDir = path.join(__dirname, '__fixtures__');

describe('plugin', () => {
  it('removes standalone HMR test if-clauses', async () => {
    const output = await transformFixture('remove-standalone-if');
    expect(output.code).toMatchSnapshot();
  });

  it('extracts else-statements following HMR test if-clauses', async () => {
    const output = await transformFixture('extract-following-else');
    expect(output.code).toMatchSnapshot();
  });

  it('extracts else-if-statements following HMR test if-clauses', async () => {
    const output = await transformFixture('extract-following-else-if');
    expect(output.code).toMatchSnapshot();
  });

  it('combines if-clauses surrounding HMR test if-statements', async () => {
    const output = await transformFixture('combine-surrounding-if');
    expect(output.code).toMatchSnapshot();
  });

  it('ignores other properties of the HMR object', async () => {
    const output = await transformFixture('ignore-other-object-properties');
    expect(output.code).toMatchSnapshot();
  });

  it('ignores other objects', async () => {
    const output = await transformFixture('ignore-other-objects');
    expect(output.code).toMatchSnapshot();
  });

  it('ignores negated HMR tests', async () => {
    const output = await transformFixture('ignore-negated-tests');
    expect(output.code).toMatchSnapshot();
  });

  it('ignores local variable bindings', async () => {
    const output = await transformFixture('ignore-local-variables');
    expect(output.code).toMatchSnapshot();
  });

  it('allows customizing object and property names', async () => {
    const output = await transformFixture('use-custom-names', {
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

  return new Promise((resolve, reject) => {
    transformFile(fixturePath, options, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
}

function getFixturePath(name) {
  return path.join(fixturesDir, `${name}.js`);
}

