const plugin = require('../src/plugin');
const {transformFile} = require('babel-core');
const path = require('path');

const defaultBabelOptions = {
  babelrc: false
};

const fixturesDir = path.join(__dirname, '__fixtures__');

describe('plugin', () => {
  describe('when transforming if statements', () => {
    it('removes standalone matching if-clauses', async () => {
      const output = await transformFixture('if/remove-standalone');
      expect(output.code).toMatchSnapshot();
    });

    it('extracts else-statements following matching if-clauses', async () => {
      const output = await transformFixture('if/extract-following-else');
      expect(output.code).toMatchSnapshot();
    });

    it('extracts else-if-statements following matching if-clauses', async () => {
      const output = await transformFixture('if/extract-following-else-if');
      expect(output.code).toMatchSnapshot();
    });

    it('extracts standalone matching negated if-clauses', async () => {
      const output = await transformFixture('if/extract-negated-tests');
      expect(output.code).toMatchSnapshot();
    });

    it('combines if-clauses surrounding matching if-clauses', async () => {
      const output = await transformFixture('if/combine-surrounding-if');
      expect(output.code).toMatchSnapshot();
    });

    it('ignores other object properties', async () => {
      const output = await transformFixture('if/ignore-other-object-properties');
      expect(output.code).toMatchSnapshot();
    });

    it('ignores other objects', async () => {
      const output = await transformFixture('if/ignore-other-objects');
      expect(output.code).toMatchSnapshot();
    });

    it('ignores local variable bindings', async () => {
      const output = await transformFixture('if/ignore-local-variables');
      expect(output.code).toMatchSnapshot();
    });
  });

  describe('when transforming conditional expressions', () => {
    it('substitutes expressions with matching tests', async () => {
      const output = await transformFixture('conditional/substitute-expression');
      expect(output.code).toMatchSnapshot();
    });

    it('substitutes expressions with matching negated tests', async () => {
      const output = await transformFixture('conditional/negated-substitute-expression');
      expect(output.code).toMatchSnapshot();
    });

    it('ignores other object properties', async () => {
      const output = await transformFixture('conditional/ignore-other-object-properties');
      expect(output.code).toMatchSnapshot();
    });

    it('ignores other objects', async () => {
      const output = await transformFixture('conditional/ignore-other-objects');
      expect(output.code).toMatchSnapshot();
    });

    it('ignores local variable bindings', async () => {
      const output = await transformFixture('conditional/ignore-local-variables');
      expect(output.code).toMatchSnapshot();
    });
  });

  describe('when using options', () => {
    it('allows customizing object and property names', async () => {
      const output = await transformFixture('using-options/customize-names', {
        objectName: 'customObjectName',
        propertyName: 'customPropertyName'
      });
      expect(output.code).toMatchSnapshot();
    });
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

