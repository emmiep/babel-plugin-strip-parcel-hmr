# babel-plugin-strip-parcel-hmr

An experimental Babel plugin for removing [hot module replacement] (HMR) code from production bundles created with [Parcel].

## Examples

**In**

```js
if (module.hot) {
  module.hot.accept(() => {
    // update module
  });
}

const value = module.hot ? 'in development' : 'in production';

// rest of the code here
```

**Out**

```js
const value = 'in production';

// rest of the code here
```

## Installation

```sh
npm install @emmiep/babel-plugin-strip-parcel-hmr
```

## Usage

**.babelrc**

```json
{
  "env": {
    "production": {
      "plugins": [
        "@emmiep/babel-plugin-strip-parcel-hmr"
      ]
    }
  }
}
```

The plugin would normally only be used for the `production` environment (which is automatically set when running [`parcel build`][parcel-production]) to preserve the HMR code during development.
This is accomplished by using the [`env` option][babel-env-option] in `.babelrc` as shown above.

## Options

**objectName**

`string`, defaults to `module`.

The name of the global object containing a property (`propertyName`) used when checking if HMR is enabled.

**propertyName**

`string`, defaults to `hot`.

The name of the property used when checking if HMR is enabled.

[hot module replacement]: https://parceljs.org/hmr.html
[Parcel]: https://parceljs.org/
[parcel-production]: https://parceljs.org/production.html
[babel-env-option]: https://babeljs.io/docs/usage/babelrc/#env-option

