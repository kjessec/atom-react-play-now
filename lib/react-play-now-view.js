'use babel';
import { React, ReactDOM } from 'react-for-atom';
import createProxy from 'react-proxy';
import deepForceUpdate from 'react-deep-force-update';
import previewFactory from './previewFactory';
import PlaceHolder from './PlaceHolder';

export default class ReactPlayNowView {
  constructor([ dirname, filename ]) {
    this.rootElement = document.createElement('div');
    this.title = `❄ rpn: ${filename}`;
  }

  getProxyContext() {
    if(!this._proxyContext) {
      const proxy = createProxy(previewFactory(PlaceHolder));
      const Proxy = proxy.get();
      const instance = ReactDOM.render(<Proxy/>, this.rootElement);

      this._proxyContext = { proxy, instance };
    }

    return this._proxyContext;
  }

  render(element) {
    const { proxy, instance } = this.getProxyContext();

    if(element instanceof Error) {
      element = <pre>{element.stack}</pre>
    };

    const mountedInstances = proxy.update(previewFactory(element));
    deepForceUpdate(instance);
  }

  getTitle() {
    return this.title || 'rpn';
  }

  destroy() {
    delete this._proxyContext;

    // silent errors
    ReactDOM.unmountComponentAtNode(this.rootElement);
  }

  getElement() {
    return this.rootElement;
  }
}
