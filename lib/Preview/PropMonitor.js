'use babel';
import React from 'react-for-atom';
import JSONTree from 'react-json-tree';

export default function PropMonitor({ targetProp }) {
  return <JSONTree data={targetProp}/>
}
