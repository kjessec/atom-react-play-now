'use babel';
import React from 'react-for-atom';
import PropMonitor from './PropMonitor';

function getPreviewStyle(options) {
  return {
    background: '#FFF',
    color: '#000',
    height: '100%',
    ...options.grid ? {
      backgroundSize: `${options.grid} ${options.grid}`,
      backgroundImage: 'linear-gradient(to right, #eee 1px, transparent 1px), linear-gradient(to bottom, #eee 1px, transparent 1px)'
    } : {},
    padding: options.padding,
  }
};

export default function previewFactory(PreviewTarget) {
  return class PreviewContainer extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        background: '#fff',
        color: '#333',
        width: '100%',
        height: '100%',
        grid: '20px',
        padding: '20px'
      };
    }

    render() {
      const PreviewTargetRendered = React.createElement(PreviewTarget);
      const previewProps = PreviewTargetRendered.props;

      console.log(PreviewTargetRendered);
      return (
        <div style={getPreviewStyle(this.state)}>
          {PreviewTargetRendered}
          <PropMonitor targetProp={previewProps}/>
        </div>
      );

    }
  }
};
