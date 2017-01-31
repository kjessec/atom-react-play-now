'use babel';
import React from 'react-for-atom';
import { pure } from 'recompose';

const __cf = (name, key) => ({ options }) =>
  <div>
    <label>{name}</label>
    <input
      className="native-key-bindings"
      type={typeof options[key] === 'boolean' ? "checkbox" : "text"}
      onChange={ev => options[key] = ev.target.value}
      value={options[key]}
    />
  </div>
;

const configGroup = [
  __cf('Background Colour', 'background'),
  __cf('Viewport Width', 'width'),
  __cf('Viewport Height', 'height'),
  __cf('Viewport Padding', 'padding'),
  __cf('Grid Size', 'grid'),
];

export default function ControlBar({ state }) {
  const { options } = state;
  return (
    <div>
      {configGroup.map(Config => <Config options={options}/>)}
    </div>
  );
}
