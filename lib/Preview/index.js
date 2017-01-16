'use babel';
import React from 'react-for-atom';
import { compose, withState } from 'recompose';
import ControlBar from './ControlBar';
import formagic from 'react-formagic';

function getDefaultState() {
  return {
    options: {
      background: '#fff',
      color: '#333',
      width: '100%',
      height: '100%',
      grid: '20px',
      padding: '20px',
      isControlBarHidden: true
    }
  };
}

function getPreviewStyle(options) {
  return {
    background: options.background,
    color: options.color,
    height: options.height,
    width: options.width,
    ...options.grid ? {
      backgroundSize: `${options.grid} ${options.grid}`,
      backgroundImage: 'linear-gradient(to right, #eee 1px, transparent 1px), linear-gradient(to bottom, #eee 1px, transparent 1px)'
    } : {},
    padding: options.padding,
  }
};

export default PreviewTarget => compose(
  withState('context', 'setContext', getDefaultState()),
  formagic(({ context }) => ({ ...context }), (newState, { setContext }) => setContext(() => newState))
)(({ formagic }) => (
  <div>
    <div>
      <ControlBar key="__cb" state={formagic}/>
    </div>
    <div style={getPreviewStyle(formagic.options)}>
      {/* This PreviewTarget is likely going to be a proxy element, so dont touch */}
      <PreviewTarget/>
    </div>
  </div>
));
