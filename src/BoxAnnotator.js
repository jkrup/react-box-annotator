import React, { Component, PropTypes } from 'react';

export default class BoxAnnotator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rects: [],
    };
    this.mousedownHandle = this.mousedownHandle.bind(this);
    this.mousemoveHandle = this.mousemoveHandle.bind(this);
    this.mouseupHandle = this.mouseupHandle.bind(this);
  }


  componentDidMount() {
    const canvas = this.canvas;
    canvas.addEventListener('mousedown', this.mousedownHandle);
    canvas.addEventListener('mousemove', this.mousemoveHandle);
    document.addEventListener('mouseup', this.mouseupHandle);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup');
  }

  mousedownHandle(e) {
    this.setState({
      mouseDown: true,
    });
    this.setState({
      currentRect: {
        x1: e.offsetX,
        y1: e.offsetY,
        width: 1,
        height: 1,
      },
    });
    document.onselectstart = () => false;
  }

  mousemoveHandle(e) {
    if (this.state.mouseDown) {
      const { x1, y1 } = this.state.currentRect;

      this.setState({
        currentRect: {
          x1,
          y1,
          width: e.offsetX - x1,
          height: e.offsetY - y1,
        },
      });
    }
  }

  convertCurrentRectToData(currentRect) {
    const { offsetWidth: imageWidth, offsetHeight: imageHeight } = this.canvas;
    const { x1, y1, width, height } = currentRect;
    const rectStyleBorder = 4;
    const dataRect = {};
    if (width > 0) {
      dataRect.x1 = (x1 / imageWidth);
      dataRect.x2 = ((x1 + width) / imageWidth);
    } else {
      dataRect.x2 = ((x1 - rectStyleBorder) / imageWidth);
      dataRect.x1 = ((x1 + width - rectStyleBorder) / imageWidth);
    }
    if (height > 0) {
      dataRect.y1 = (y1 / imageHeight);
      dataRect.y2 = ((y1 + height) / imageHeight);
    } else {
      dataRect.y2 = ((y1 - rectStyleBorder) / imageHeight);
      dataRect.y1 = ((y1 + height - rectStyleBorder) / imageHeight);
    }

    return dataRect;
  }

  convertRectDataToUIRect(rect) {
    const { offsetWidth: imageWidth, offsetHeight: imageHeight } = this.canvas;
    const { x1, x2, y1, y2 } = rect;

    const log =  {
      x1: x1 * imageWidth,
      width: (x2 - x1) * imageWidth,
      y1: y1 * imageHeight,
      height: (y2 - y1) * imageHeight,
    };

    return log;
  }

  mouseupHandle() {
    if (this.state.mouseDown) {
      const nextRect = this.convertCurrentRectToData(this.state.currentRect);
      this.setState({
        currentRect: null,
        rects: [
          ...this.state.rects,
          nextRect,
        ],
        mouseDown: false,
      }, () => {
        if (this.props.drawHandle) {
          this.props.drawHandle(this.state);
        }
      });
    }
  }

  rectToStyles(currentRect) {
    const { x1, y1, width, height } = currentRect;
    const canvas = this.canvas;

    const styleObject = {
      position: 'absolute',
      border: '2px dotted #000',
    };

    if (width > 0) {
      styleObject.left = x1;
    } else {
      styleObject.right = canvas.offsetWidth - x1;
    }

    if (height > 0) {
      styleObject.top = y1;
    } else {
      styleObject.bottom = canvas.offsetHeight - y1;
    }

    styleObject.width = Math.abs(width);
    styleObject.height = Math.abs(height);
    styleObject.zIndex = 3;

    return styleObject;

  }

  render() {
    const { image } = this.props; // logic to render when it's found

    const canvasStyles = {
      zIndex: this.state.mouseDown ? 4 : 2,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      cursor: 'crosshair',
    };

    const xStyle = {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      width: '15px',
      height: '15px',
      background: 'hsl(0, 0%, 0%)',
      lineHeight: '15px',
      padding: '0',
      display: 'block',
      margin: '0 auto',
      color: 'hsl(0, 0%, 100%)',
      overflow: 'hidden',
      textAlign: 'center',
      borderRadius: '100%',
      border: '0',
      outline: '0',
      '-webkit-appearance': 'none',
      fontSize: '12px',
      cursor: 'pointer',
    };

    const removeRect = (i) => {
      this.setState({
        rects: [
          ...this.state.rects.slice(0, i),
          ...this.state.rects.slice(i + 1),
        ],
      }, () => {
        if (this.props.drawHandle) {
          this.props.drawHandle(this.state);
        }
      });
    };

    const renderRects = () => (
      this.state.rects.map((rect, i) => {
        const style = this.rectToStyles(this.convertRectDataToUIRect(rect));
        return (
          <div key={i} style={style}>
            <button style={xStyle} onClick={() => { removeRect(i); }}>×</button>
          </div>
        );
      })
    );

    return (
      <div style={{ lineHeight: 0, background: 'black', position: 'relative', display: 'inline-block' }}>
        <img src={this.props.image} role="presentation" style={{ maxWidth: '100%', maxHeight: '100%' }} />
        <div ref={(c) => { this.canvas = c; }} style={canvasStyles} />
        { renderRects() }
        { this.state.currentRect && <div style={this.rectToStyles(this.state.currentRect)} /> }
      </div>
    );
  }
}
BoxAnnotator.propTypes = {
  image: PropTypes.string,
  drawHandle: PropTypes.func,
};
