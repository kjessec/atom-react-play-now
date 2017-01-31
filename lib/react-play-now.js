'use babel';
import ReactPlayNowView from './react-play-now-view';
import { CompositeDisposable } from 'atom';
import fs from 'fs';
import path from 'path';
import url from 'url';
import module from 'module';
import chokidar from 'chokidar';
import createLiveCompileZone from './createLiveCompileZone';
import babelrc from '../fixtures/babelrc.js';

// pre-load all babel related stuff here
// transpilers are lazily required upon the first compilation,
// so run a 'noop' compilation once here
// this ensures all transpilers are required beforehand
import { transform } from 'babel-core';
transform('', babelrc);

export default {
  subscriptions: null,
  ongoingPreviews: {},
  watchers: {},
  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('.tree-view .file .name', {
      'react-play-now:start': ({ target }) => this.start(target)
    }));

    // add preview opener
    atom.workspace.addOpener(uri =>  {
      const { protocol, pathname } = url.parse(uri);
      if(protocol !== 'react-play-now:') return;

      const filename = path.normalize(pathname.slice(1));
      const relativizedPath = atom.project.relativizePath(filename);
      const preview = this.ongoingPreviews[filename] =
        this.ongoingPreviews[filename]
          ? this.ongoingPreviews[filename]
          : new ReactPlayNowView(relativizedPath);

      // shim destroy function to remove from cache
      const _destroy = preview.destroy.bind(preview);
      preview.destroy = () => {
        // prune preview cache
        delete this.ongoingPreviews[filename];

        // uninstall chokidar listener
        this.watchers[filename].close();
        delete this.watchers[filename];

        // finally, destroy view itself
        _destroy();
      };

      return preview;
    });
  },

  start(target) {
    const filename = target.dataset.path;
    const [contextPath, filepath] = atom.project.relativizePath(filename);

    atom.workspace.open(`react-play-now://@/${filename}`, { split: 'right' }).then(view => {
      // start watching for file changes baby
      // disallow duplicate watchers for the same entry
      const watcher = this.watchers[filename] = this.watchers[filename] || chokidar.watch(filename).on('change', path => {
        delete module._cache[filename];
        delete module._cache[path];
        render();
      });

      // compileZone is strictly re-requiring the base file.
      // in chokidar listener the require cache to this filename would have been removed,
      // so this is safe to do
      delete module._cache[filename];
      // const compileZone = () => require(filename);

      // this is safe to do so as watcher never allows duplicate entries within itself
      const watchDeps = dependencies => dependencies.forEach(dep => {
        console.log('start watching...', dependencies);
        try { watcher.add(require.resolve(dep)); } catch(e) { /* do nothing */ }
      });

      // this will transpile & compile subsequent requires using babel
      // entry is whatever returned by `compileZone()`
      // also, for all dependencies, we need to install a chokidar listener,
      // so yeah
      function render() {
        try {
          view.render(createLiveCompileZone(contextPath, () => require(filename), watchDeps));
        } catch(e) {
          atom.notifications.addError('react-play-now: Error during render', {
            dismissable: true,
            detail: e.message,
            stack: e.stack
          });
        }
      }

      // initial render
      render();
    }).catch(e => {
      console.log(e);
    });
  },

  deactivate() {
    this.subscriptions.dispose();
    Object.keys(this.ongoingPreviews).forEach(key => this.ongoingPreviews[key].destroy());
    Object.keys(this.watchers).forEach(key => this.watchers[key].close());
  },

  serialize() {}
};
