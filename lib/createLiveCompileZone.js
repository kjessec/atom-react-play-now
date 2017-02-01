'use babel';
import fs from 'fs';
import { transform } from 'babel-core';
import path from 'path';
import module from 'module';
import babelrc from '../fixtures/babelrc.js';
import detective from 'babel-plugin-detective';

// stub react to https://www.npmjs.com/package/react-for-atom
// below stub will ONLY be active between createLiveCompileZone bracket
import mockery from 'mockery';
import { React, ReactDOM } from 'react-for-atom';

mockery.registerMock('react', React);
mockery.registerMock('react-dom', ReactDOM);

// user-code will likely NOT have 'use babel' annotation at the beginning,
// so we need to compile user codes with babel on the fly.
// using babel-core here..
// since all require calls are synchronous,
// it is safe to monkey patch compiler routine like so
// no other require calls can happen during this
// super hackish bracketing
export default function createLiveCompileZone(contextPath, compile, reportDeps = function() {}) {
  const depsList = new Set();
  const oldCompilers = module._extensions;
  const oldProcessEnv = process.env.NODE_ENV;

  // enable mockery
  mockery.enable({ warnOnUnregistered: false });
  process.env.NODE_ENV = "development";

  // stub extension handlers
  // warning: SUPER HACKY!!!
  module._extensions = {
    ...module._extensions,
    '.js': function liveCompiler(module, filename) {
      // if the given file is not derived from the contextPath (project path)
      // don't bother transpiling
      if(filename.indexOf(contextPath) === -1) {
        oldCompilers['.js'](module, filename);
        return;
      }

      // otherwise, do transform then compile
      const transformed = transform(fs.readFileSync(filename), babelrc);
      console.log('loading', filename);
      module._compile(transformed.code, filename);

      // only report dependency list of local files,
      // meaning nothing under node_modules
      // TODO: this behaviour is probably not pleasing as much,
      // as many people seem to manually provide their packages from node_modules directory
      // meh :\
      if(filename.indexOf('node_modules') === -1) {
        // idk why but I really like using reduce
        ((detective.metadata(transformed) || {}).strings || []).reduce((set, entry) =>
          // remove duplicates using Set
          set.add(path.resolve(path.dirname(filename), entry), depsList),
          //
          depsList
        );
      }
    }
  };

  let compiled;

  // do a compile
  try {
    compiled = compile();
  } catch(e) {
    compiled = e;
  }

  process.env.NODE_ENV = oldProcessEnv;

  // disable mockery right after compilation
  mockery.disable();

  // restore compilers
  module._extensions = oldCompilers;

  // report deps list
  reportDeps(depsList);

  // return compiled result
  return compiled;
}
