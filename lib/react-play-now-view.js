'use babel';
import { React, ReactDOM } from 'react-for-atom';
import createProxy from 'react-proxy';
import deepForceUpdate from 'react-deep-force-update';
import previewFactory from './Preview';
import PlaceHolder from './PlaceHolder';

const { isValidElement } = React;

export default class ReactPlayNowView {
  constructor([ dirname, filename ]) {
    this.rootElement = document.createElement('div');
    this.title = `❄ rpn: ${filename}`;
  }

  getProxyContext() {
    if(!this._proxyContext) {
      // force "correct" React render by using a placeholder
      const proxy = createProxy(previewFactory(PlaceHolder));
      const Proxy = proxy.get();
      const instance = ReactDOM.render(<Proxy/>, this.rootElement);

      this._proxyContext = { proxy, instance };
    }

    return this._proxyContext;
  }

  render(component) {
    const { proxy, instance } = this.getProxyContext();

    // component MUST be a React Component, either a class extending React.Component
    // or a functional Component
    // in either cases checking the type of component is less than enough,
    // however we can prevent inconsistent react state by not even trying to render
    // what's not going to be rendered anyway
    if(typeof component !== 'function') {
      component = () => component instanceof Error
        ? <pre>{component.stack}</pre>
        : <pre>Oops! Received component doesn't seem to be a valid React Component.</pre>
    };

    const mountedInstances = proxy.update(previewFactory(component));
    deepForceUpdate(instance);
  }

  getTitle() {
    return this.title || 'rpn';
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.rootElement);
    delete this._proxyContext;
  }

  getElement() {
    return this.rootElement;
  }
}
