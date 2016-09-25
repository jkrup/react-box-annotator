import React, { Component } from 'react';
import prettyjson from 'prettyjson';
import BoxAnnotator from '../src';
import imgBase64 from './img';

export default class BoxAnnotatorStory extends Component {
  render() {
    const imageSrc = `data:image/png;base64,${imgBase64}`;

    const { boxes = [] } = this.state || {};

    const drawHandle = (obj) => {
      console.log(obj);
      this.setState({ boxes: obj.rects });
    };


    return (
      <div>
        <BoxAnnotator image={imageSrc} drawHandle={drawHandle} />
        <textarea rows="10" value={prettyjson.render(boxes, { noColor: true })} />
      </div>
    );
  }
}
