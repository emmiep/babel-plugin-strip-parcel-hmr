const plugin = require('../src/index');
const {transform} = require('babel-core');

const defaultBabelOptions = {
  babelrc: false
};

describe('plugin', () => {
  let babelOptions;

  beforeEach(() => babelOptions = Object.assign({}, defaultBabelOptions, {
    plugins: [plugin]
  }));

  it('removes standalone if-statements testing for HMR', () => {
    const input = `
      before;
      if (module.hot) {
        shouldBeRemoved;
      }
      after;
    `;

    const output = transform(input, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('keeps if-statements testing other properties of the module object', () => {
    const input = `
      if (module.notHot) {
        shouldBeKept;
      }
    `;

    const output = transform(input, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('keeps if-statement testing other objects with a hot property', () => {
    const input = `
      if (notModule.hot) {
        shouldBeKept;
      }
    `;

    const output = transform(input, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('keeps negated if-statements testing for HMR', () => {
    const input = `
      if (!module.hot) {
        shouldBeKept;
      }
    `;

    const output = transform(input, babelOptions);
    expect(output.code).toMatchSnapshot();
  });

  it('keeps if-statements testing local module variables', () => {
    const input = `
      const module = {hot: true};

      if (module.hot) {
        shouldBeKept;
      }
    `;

    const output = transform(input, babelOptions);
    expect(output.code).toMatchSnapshot();
  });
});

