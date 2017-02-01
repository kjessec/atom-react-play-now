'use babel';
import { React, ReactDOM } from 'react-for-atom';
import createProxy from 'react-proxy';
import deepForceUpdate from 'react-deep-force-update';
import previewFactory from './Preview';
import { toClass } from 'recompose';
import util from 'util';

const Placeholder = () => <h1>Hello, you! I am a placeholder, so if you are seeing me here, something must have gone wrong.</h1>;

export default class ReactPlayNowView {
  constructor([ dirname, filename ], context) {
    this.rootElement = document.createElement('div');
    this.title = `❄ rpn: ${filename}`;
    this.context = context;
  }

  getProxyContext() {
    if(!this.proxyContext) {
      // force "correct" React render by using a placeholder
      const proxy = createProxy(toClass(Placeholder));
      const Proxy = proxy.get();
      const instance = ReactDOM.render(
        React.createElement(previewFactory(Proxy)),
        this.rootElement
      );

      this.proxyContext = { proxy, instance };
    }
    return this.proxyContext;
  }

  render(component) {
    const { proxy, instance } = this.getProxyContext();

    // component MUST be a React Component, either a class extending React.Component
    // or a functional Component
    // in either cases checking the type of component is less than enough,
    // however we can prevent inconsistent react state by not even trying to render
    // what's not going to be rendered anyway
    if(typeof component !== 'function') {
      atom.notifications.addError('react-play-now: Error during render', {
        dismissable: true,
        detail: component.message || '',
        stack: component.stack || component.message || component.toString()
      });
      return;
      // _component = component;
      // component = () => <pre>
      //   {_component.stack || _component.message || _component.toString()}
      // </pre>
    };

    proxy.update(toClass(component));
    deepForceUpdate(instance);
  }

  getTitle() {
    return this.title || 'rpn';
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.rootElement);
    delete this.proxyContext;
  }

  getElement() {
    return this.rootElement;
  }
}
