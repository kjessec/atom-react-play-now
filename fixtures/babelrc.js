'use babel';
import path from 'path';
const __b = (_p, arr) => arr.map(mp => path.resolve(`${__dirname}/../node_modules/babel-${_p}-${mp}`));

export default {
  "presets": __b('preset', [
    "es2015",
    "react"
  ]),
  "plugins": __b('plugin', [
    "add-module-exports",
    "transform-object-rest-spread",
    "transform-export-extensions",
    "detective"
  ]),
  "babelrc": false
};
