'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var Component = React.Component;

var ReactDOM = require('react-dom');
var deepExtend = require('deep-extend');
var PropTypes = require('prop-types');
var findDOMNode = ReactDOM.findDOMNode;

var Cropper = function (_Component) {
  _inherits(Cropper, _Component);

  function Cropper(props) {
    _classCallCheck(this, Cropper);

    var _this = _possibleConstructorReturn(this, (Cropper.__proto__ || Object.getPrototypeOf(Cropper)).call(this, props));

    var originX = props.originX,
        originY = props.originY,
        width = props.width,
        height = props.height,
        fixedRatio = props.fixedRatio,
        ratio = props.ratio,
        styles = props.styles,
        src = props.src;


    _this.state = {
      // image and clone image src
      src: src,
      // background image width
      imgWidth: '100%',
      // background image height
      imgHeight: 'auto',
      // cropper width, drag trigger changing
      frameWidth4Style: width,
      // cropper height, drag trigger changing
      frameHeight4Style: fixedRatio ? width / ratio : height,
      // cropper height, drag trigger changing
      toImgTop4Style: 0,
      toImgLeft4Style: 0,
      // cropper original position(x axis), accroding to image left
      originX: originX,
      // cropper original position(y axis), accroding to image top
      originY: originY,
      // dragging start, position's pageX and pageY
      startPageX: 0,
      startPageY: 0,
      // frame width, change only dragging stop
      frameWidth: width,
      // frame height, change only dragging stop
      frameHeight: fixedRatio ? width / ratio : height,
      dragging: false,
      maxLeft: 0,
      maxTop: 0,
      action: null,
      imgLoaded: false,
      styles: deepExtend({}, defaultStyles, styles)
    };
    return _this;
  }

  // initialize style, component did mount or component updated.


  _createClass(Cropper, [{
    key: 'initStyles',
    value: function initStyles() {
      var _this2 = this;

      var container = findDOMNode(this.container);
      this.setState({
        imgWidth: container.offsetWidth
      }, function () {
        // calc frame width height
        var _props = _this2.props,
            originX = _props.originX,
            originY = _props.originY,
            disabled = _props.disabled;


        if (disabled) return;

        var _state = _this2.state,
            imgWidth = _state.imgWidth,
            imgHeight = _state.imgHeight;
        var _state2 = _this2.state,
            frameWidth = _state2.frameWidth,
            frameHeight = _state2.frameHeight;


        var maxLeft = imgWidth - frameWidth;
        var maxTop = imgHeight - frameHeight;

        if (originX + frameWidth >= imgWidth) {
          originX = imgWidth - frameWidth;
          _this2.setState({
            originX: originX
          });
        }
        if (originY + frameHeight >= imgHeight) {
          originY = imgHeight - frameHeight;
          _this2.setState({
            originY: originY
          });
        }

        _this2.setState({
          maxLeft: maxLeft,
          maxTop: maxTop
        });
        // calc clone position
        _this2.calcPosition(frameWidth, frameHeight, originX, originY, function () {
          var _state3 = _this2.state,
              frameWidth4Style = _state3.frameWidth4Style,
              frameHeight4Style = _state3.frameHeight4Style,
              toImgTop4Style = _state3.toImgTop4Style,
              toImgLeft4Style = _state3.toImgLeft4Style;


          _this2.setState({
            frameWidth: frameWidth4Style,
            frameHeight: frameHeight4Style,
            originX: toImgLeft4Style,
            originY: toImgTop4Style
          });
        });
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      // event
      document.addEventListener('mousemove', this.handleDrag.bind(this));
      document.addEventListener('touchmove', this.handleDrag.bind(this));
      document.addEventListener('mouseup', this.handleDragStop.bind(this));
      document.addEventListener('touchend', this.handleDragStop.bind(this));
      this.imgGetSizeBeforeLoad();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // remove event
      document.removeEventListener('mousemove', this.handleDrag.bind(this));
      document.removeEventListener('touchmove', this.handleDrag.bind(this));
      document.removeEventListener('mouseup', this.handleDragStop.bind(this));
      document.removeEventListener('touchend', this.handleDragStop.bind(this));
    }

    // props change to update frame

  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      var _this3 = this;

      var _props2 = this.props,
          width = _props2.width,
          height = _props2.height,
          originX = _props2.originX,
          originY = _props2.originY;

      // img src changed

      if (this.props.src !== newProps.src) {
        return this.setState({
          src: newProps.src
        }, this.imgGetSizeBeforeLoad);
      }

      if (width !== newProps.width || height !== newProps.height || originX !== newProps.originX || originY !== newProps.originY) {
        // update frame
        this.setState({
          frameWidth: newProps.width,
          frameHeight: newProps.height,
          originX: newProps.originX,
          originY: newProps.originY
        }, function () {
          return _this3.initStyles();
        });
      }
    }

    // image onloaded hook

  }, {
    key: 'imgOnLoad',
    value: function imgOnLoad() {
      this.props.onImgLoad();
    }

    // adjust image height when image size scaleing change, also initialize styles

  }, {
    key: 'imgGetSizeBeforeLoad',
    value: function imgGetSizeBeforeLoad() {
      var _this4 = this;

      // trick way to get natural width of image after component did mount
      setTimeout(function () {
        var img = findDOMNode(_this4.img);
        if (img && img.naturalWidth) {
          // image scaleing
          var imgHeight = parseInt(img.offsetWidth / img.naturalWidth * img.naturalHeight);
          // resize imgHeight
          _this4.setState({
            imgHeight: imgHeight,
            imgLoaded: true
          }, _this4.initStyles);
          // before image loaded hook
          _this4.props.beforeImgLoad();
        } else if (img) {
          // catch if image natural width is 0
          _this4.imgGetSizeBeforeLoad();
        }
      }, 0);
    }

    // frame width, frame height, position left, position top

  }, {
    key: 'calcPosition',
    value: function calcPosition(width, height, left, top, callback) {
      var _state4 = this.state,
          imgWidth = _state4.imgWidth,
          imgHeight = _state4.imgHeight;
      var _props3 = this.props,
          ratio = _props3.ratio,
          fixedRatio = _props3.fixedRatio;
      // width < 0 or height < 0, frame invalid

      if (width < 0 || height < 0) return false;
      // if ratio is fixed
      if (fixedRatio) {
        // adjust by width
        if (width / imgWidth > height / imgHeight) {
          if (width > imgWidth) {
            width = imgWidth;
            left = 0;
            height = width / ratio;
          }
        } else {
          // adjust by height
          if (height > imgHeight) {
            height = imgHeight;
            top = 0;
            width = height * ratio;
          }
        }
      }
      // frame width plus offset left, larger than img's width
      if (width + left > imgWidth) {
        if (fixedRatio) {
          // if fixed ratio, adjust left with width
          left = imgWidth - width;
        } else {
          // resize width with left
          width = width - (width + left - imgWidth);
        }
      }
      // frame heigth plust offset top, larger than img's height
      if (height + top > imgHeight) {
        if (fixedRatio) {
          // if fixed ratio, adjust top with height
          top = imgHeight - height;
        } else {
          // resize height with top
          height = height - (height + top - imgHeight);
        }
      }
      // left is invalid
      if (left < 0) {
        left = 0;
      }
      // top is invalid
      if (top < 0) {
        top = 0;
      }
      // if frame width larger than img width
      if (width > imgWidth) {
        width = imgWidth;
      }
      // if frame height larger than img height
      if (height > imgHeight) {
        height = imgHeight;
      }
      this.setState({
        toImgLeft4Style: left,
        toImgTop4Style: top,
        frameWidth4Style: width,
        frameHeight4Style: height
      }, function () {
        if (callback) callback();
      });
    }

    // create a new frame, and drag, so frame width and height is became larger.

  }, {
    key: 'createNewFrame',
    value: function createNewFrame(e) {
      if (this.state.dragging) {
        // click or touch event
        var _ref = e.pageX ? e : e.targetTouches[0],
            pageX = _ref.pageX,
            pageY = _ref.pageY;

        var _props4 = this.props,
            ratio = _props4.ratio,
            fixedRatio = _props4.fixedRatio;
        var _state5 = this.state,
            frameWidth = _state5.frameWidth,
            frameHeight = _state5.frameHeight,
            startPageX = _state5.startPageX,
            startPageY = _state5.startPageY,
            originX = _state5.originX,
            originY = _state5.originY;
        // click or touch point's offset from source image top

        var _x = pageX - startPageX;
        var _y = pageY - startPageY;

        // frame new width, height, left, top
        var _width = frameWidth + Math.abs(_x);
        var _height = fixedRatio ? (frameWidth + Math.abs(_x)) / ratio : frameHeight + Math.abs(_y);
        var _left = originX;
        var _top = originY;

        if (_y < 0) {
          // drag and resize to top, top changing
          _top = fixedRatio ? originY - Math.abs(_x) / ratio : originY - Math.abs(_y);
        }

        if (_x < 0) {
          // drag and resize, go to left, left changing
          _left = originX + _x;
        }
        // calc position
        return this.calcPosition(_width, _height, _left, _top);
      }
    }

    // frame move handler

  }, {
    key: 'frameMove',
    value: function frameMove(e) {
      var _state6 = this.state,
          originX = _state6.originX,
          originY = _state6.originY,
          startPageX = _state6.startPageX,
          startPageY = _state6.startPageY,
          frameWidth = _state6.frameWidth,
          frameHeight = _state6.frameHeight,
          maxLeft = _state6.maxLeft,
          maxTop = _state6.maxTop;

      var _ref2 = e.pageX ? e : e.targetTouches[0],
          pageX = _ref2.pageX,
          pageY = _ref2.pageY;

      var _x = pageX - startPageX + originX;
      var _y = pageY - startPageY + originY;
      if (pageX < 0 || pageY < 0) return false;

      if (_x > maxLeft) _x = maxLeft;
      if (_y > maxTop) _y = maxTop;
      // frame width, frame height not change, top and left changing
      this.calcPosition(frameWidth, frameHeight, _x, _y);
    }

    // drag dot to different direction

  }, {
    key: 'frameDotMove',
    value: function frameDotMove(dir, e) {
      var _ref3 = e.pageX ? e : e.targetTouches[0],
          pageX = _ref3.pageX,
          pageY = _ref3.pageY;

      var _props5 = this.props,
          ratio = _props5.ratio,
          fixedRatio = _props5.fixedRatio;
      var _state7 = this.state,
          startPageX = _state7.startPageX,
          startPageY = _state7.startPageY,
          originX = _state7.originX,
          originY = _state7.originY,
          frameWidth4Style = _state7.frameWidth4Style,
          frameHeight4Style = _state7.frameHeight4Style,
          frameWidth = _state7.frameWidth,
          frameHeight = _state7.frameHeight,
          imgWidth = _state7.imgWidth,
          imgHeight = _state7.imgHeight;


      if (pageY !== 0 && pageX !== 0) {
        // current drag position offset x and y to first drag start position
        var _x = pageX - startPageX;
        var _y = pageY - startPageY;

        var _width = 0;
        var _height = 0;
        var _top = 0;
        var _left = 0;
        // just calc width, height, left, top in each direction
        switch (dir) {
          case 'ne':
            _width = frameWidth + _x;
            _height = fixedRatio ? _width / ratio : frameHeight - _y;
            _left = originX;
            _top = fixedRatio ? originY - _x / ratio : originY + _y;
            break;
          case 'e':
            _width = frameWidth + _x;
            _height = fixedRatio ? _width / ratio : frameHeight;
            _left = originX;
            _top = fixedRatio ? originY - _x / ratio * 0.5 : originY;
            break;
          case 'se':
            _width = frameWidth + _x;
            _height = fixedRatio ? _width / ratio : frameHeight + _y;
            _left = originX;
            _top = originY;
            break;
          case 'n':
            _height = frameHeight - _y;
            _width = fixedRatio ? _height * ratio : frameWidth;
            _left = fixedRatio ? originX + _y * ratio * 0.5 : originX;
            _top = originY + _y;
            break;
          case 'nw':
            _width = frameWidth - _x;
            _height = fixedRatio ? _width / ratio : frameHeight - _y;
            _left = originX + _x;
            _top = fixedRatio ? originY + _x / ratio : originY + _y;
            break;
          case 'w':
            _width = frameWidth - _x;
            _height = fixedRatio ? _width / ratio : frameHeight;
            _left = originX + _x;
            _top = fixedRatio ? originY + _x / ratio * 0.5 : originY;
            break;
          case 'sw':
            _width = frameWidth - _x;
            _height = fixedRatio ? _width / ratio : frameHeight + _y;
            _left = originX + _x;
            _top = originY;
            break;
          case 's':
            _height = frameHeight + _y;
            _width = fixedRatio ? _height * ratio : frameWidth;
            _left = fixedRatio ? originX - _y * ratio * 0.5 : originX;
            _top = originY;
            break;
          default:
            break;
        }

        if (_width > imgWidth || _height > imgHeight) {
          if (frameWidth4Style >= imgWidth || frameHeight4Style >= imgHeight) {
            return false;
          }
        }

        return this.calcPosition(_width, _height, _left, _top);
      }
    }

    // judge whether to create new frame, frame or frame dot move acroding to action

  }, {
    key: 'handleDrag',
    value: function handleDrag(e) {
      if (this.state.dragging) {
        e.preventDefault();
        var action = this.state.action;


        if (!action) return this.createNewFrame(e);
        if (action === 'move') return this.frameMove(e);
        this.frameDotMove(action, e);
      }
    }

    // starting dragging

  }, {
    key: 'handleDragStart',
    value: function handleDragStart(e) {
      var _this5 = this;

      var allowNewSelection = this.props.allowNewSelection;


      var action = e.target.getAttribute('data-action') ? e.target.getAttribute('data-action') : e.target.parentNode.getAttribute('data-action');

      var _ref4 = e.pageX ? e : e.targetTouches[0],
          pageX = _ref4.pageX,
          pageY = _ref4.pageY;

      // if drag or move or allow new selection, change startPageX, startPageY, dragging state


      if (action || allowNewSelection) {
        e.preventDefault();
        // drag start, set startPageX, startPageY for dragging start point
        this.setState({
          startPageX: pageX,
          startPageY: pageY,
          dragging: true,
          action: action
        });
      }
      // if no action and allowNewSelection, then create a new frame
      if (!action && allowNewSelection) {
        var container = findDOMNode(this.container);
        var offsetLeft = container.offsetLeft,
            offsetTop = container.offsetTop;


        this.setState({
          // set offset left and top of new frame
          originX: pageX - offsetLeft,
          originY: pageY - offsetTop,
          frameWidth: 2,
          frameHeight: 2
        }, function () {
          return _this5.calcPosition(2, 2, pageX - offsetLeft, pageY - offsetTop);
        });
      }
    }

    // crop image

  }, {
    key: 'crop',
    value: function crop() {
      var img = findDOMNode(this.img);
      var canvas = document.createElement('canvas');
      var _values$original = this.values().original,
          x = _values$original.x,
          y = _values$original.y,
          width = _values$original.width,
          height = _values$original.height;


      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, x, y, width, height, 0, 0, width, height);
      return canvas.toDataURL();
    }

    // get current values

  }, {
    key: 'values',
    value: function values() {
      var img = findDOMNode(this.img);
      var _state8 = this.state,
          frameWidth = _state8.frameWidth,
          frameHeight = _state8.frameHeight,
          originX = _state8.originX,
          originY = _state8.originY,
          imgWidth = _state8.imgWidth,
          imgHeight = _state8.imgHeight;

      // crop accroding image's natural width

      var _scale = img.naturalWidth / imgWidth;
      var realFrameWidth = frameWidth * _scale;
      var realFrameHeight = frameHeight * _scale;
      var realOriginX = originX * _scale;
      var realOriginY = originY * _scale;

      return {
        display: {
          width: frameWidth,
          height: frameHeight,
          x: originX,
          y: originY,
          imgWidth: imgWidth,
          imgHeight: imgHeight
        },
        original: {
          width: realFrameWidth,
          height: realFrameHeight,
          x: realOriginX,
          y: realOriginY,
          imgWidth: img.naturalWidth,
          imgHeight: img.naturalHeight
        }
      };
    }

    // stop dragging

  }, {
    key: 'handleDragStop',
    value: function handleDragStop(e) {
      var _this6 = this;

      if (this.state.dragging) {
        e.preventDefault();

        var _findDOMNode = findDOMNode(this.frameNode),
            offsetLeft = _findDOMNode.offsetLeft,
            offsetTop = _findDOMNode.offsetTop,
            offsetWidth = _findDOMNode.offsetWidth,
            offsetHeight = _findDOMNode.offsetHeight;

        var _state9 = this.state,
            imgWidth = _state9.imgWidth,
            imgHeight = _state9.imgHeight;


        this.setState({
          originX: offsetLeft,
          originY: offsetTop,
          dragging: false,
          frameWidth: offsetWidth,
          frameHeight: offsetHeight,
          maxLeft: imgWidth - offsetWidth,
          maxTop: imgHeight - offsetHeight,
          action: null
        }, function () {
          var onChange = _this6.props.onChange;

          if (onChange) onChange(_this6.values());
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this7 = this;

      var _state10 = this.state,
          dragging = _state10.dragging,
          imgHeight = _state10.imgHeight,
          imgWidth = _state10.imgWidth,
          imgLoaded = _state10.imgLoaded,
          styles = _state10.styles,
          src = _state10.src;
      var disabled = this.props.disabled;


      var imageNode = React.createElement(
        'div',
        {
          style: styles.source,
          ref: function ref(_ref6) {
            _this7.sourceNode = _ref6;
          }
        },
        React.createElement('img', {
          crossOrigin: 'anonymous',
          src: src,
          width: imgWidth,
          height: imgHeight,
          ref: function ref(_ref5) {
            _this7.img = _ref5;
          },
          style: deepExtend({}, styles.img, styles.source_img),
          onLoad: this.imgOnLoad.bind(this)
        })
      );
      // disabled cropper
      if (disabled) {
        return React.createElement(
          'div',
          {
            style: deepExtend({}, styles.container, {
              'position': 'relative',
              'height': imgHeight
            }),
            ref: function ref(_ref7) {
              _this7.container = _ref7;
            }
          },
          imageNode,
          React.createElement('div', {
            style: deepExtend({}, styles.modal, styles.modal_disabled)
          })
        );
      }

      return React.createElement(
        'div',
        {
          onMouseDown: this.handleDragStart.bind(this),
          onTouchStart: this.handleDragStart.bind(this),
          style: deepExtend({}, styles.container, {
            'position': 'relative',
            'height': imgHeight
          }),
          ref: function ref(_ref10) {
            _this7.container = _ref10;
          }
        },
        imageNode,
        imgLoaded ? React.createElement(
          'div',
          null,
          React.createElement('div', {
            style: styles.modal
          }),
          React.createElement(
            'div',
            {
              style: deepExtend({}, styles.frame, dragging ? styles.dragging_frame : {}, {
                display: 'block',
                left: this.state.toImgLeft4Style,
                top: this.state.toImgTop4Style,
                width: this.state.frameWidth4Style,
                height: this.state.frameHeight4Style
              }),
              ref: function ref(_ref9) {
                _this7.frameNode = _ref9;
              }
            },
            React.createElement(
              'div',
              {
                style: styles.clone
              },
              React.createElement('img', {
                src: src,
                crossOrigin: 'anonymous',
                width: imgWidth,
                height: imgHeight,
                style: deepExtend({}, styles.img, {
                  marginLeft: -1 * this.state.toImgLeft4Style,
                  marginTop: -1 * this.state.toImgTop4Style
                }),
                ref: function ref(_ref8) {
                  _this7.cloneImg = _ref8;
                }
              })
            ),
            React.createElement('span', {
              'data-action': 'move',
              style: styles.move
            }),
            React.createElement(
              'span',
              {
                'data-action': 'move',
                style: deepExtend({}, styles.dot, styles.dotCenter)
              },
              React.createElement('span', {
                style: deepExtend({}, styles.dotInner, styles.dotInnerCenterVertical)
              }),
              React.createElement('span', {
                style: deepExtend({}, styles.dotInner, styles.dotInnerCenterHorizontal)
              })
            ),
            React.createElement(
              'span',
              {
                'data-action': 'ne',
                style: deepExtend({}, styles.dot, styles.dotNE)
              },
              React.createElement('span', {
                style: deepExtend({}, styles.dotInner, styles.dotInnerNE)
              })
            ),
            React.createElement(
              'span',
              {
                'data-action': 'n',
                style: deepExtend({}, styles.dot, styles.dotN)
              },
              React.createElement('span', {
                style: deepExtend({}, styles.dotInner, styles.dotInnerN)
              })
            ),
            React.createElement(
              'span',
              {
                'data-action': 'nw',
                style: deepExtend({}, styles.dot, styles.dotNW)
              },
              React.createElement('span', {
                style: deepExtend({}, styles.dotInner, styles.dotInnerNW)
              })
            ),
            React.createElement(
              'span',
              {
                'data-action': 'e',
                style: deepExtend({}, styles.dot, styles.dotE)
              },
              React.createElement('span', {
                style: deepExtend({}, styles.dotInner, styles.dotInnerE)
              })
            ),
            React.createElement(
              'span',
              {
                'data-action': 'w',
                style: deepExtend({}, styles.dot, styles.dotW)
              },
              React.createElement('span', {
                style: deepExtend({}, styles.dotInner, styles.dotInnerW)
              })
            ),
            React.createElement(
              'span',
              {
                'data-action': 'se',
                style: deepExtend({}, styles.dot, styles.dotSE)
              },
              React.createElement('span', {
                style: deepExtend({}, styles.dotInner, styles.dotInnerSE)
              })
            ),
            React.createElement(
              'span',
              {
                'data-action': 's',
                style: deepExtend({}, styles.dot, styles.dotS)
              },
              React.createElement('span', {
                style: deepExtend({}, styles.dotInner, styles.dotInnerS)
              })
            ),
            React.createElement(
              'span',
              {
                'data-action': 'sw',
                style: deepExtend({}, styles.dot, styles.dotSW)
              },
              React.createElement('span', {
                style: deepExtend({}, styles.dotInner, styles.dotInnerSW)
              })
            ),
            React.createElement('span', {
              'data-action': 'n',
              style: deepExtend({}, styles.line, styles.lineN)
            }),
            React.createElement('span', {
              'data-action': 's',
              style: deepExtend({}, styles.line, styles.lineS)
            }),
            React.createElement('span', {
              'data-action': 'w',
              style: deepExtend({}, styles.line, styles.lineW)
            }),
            React.createElement('span', {
              'data-action': 'e',
              style: deepExtend({}, styles.line, styles.lineE)
            })
          )
        ) : null
      );
    }
  }]);

  return Cropper;
}(Component);

Cropper.propTypes = {
  src: PropTypes.string.isRequired,
  originX: PropTypes.number,
  originY: PropTypes.number,
  ratio: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  fixedRatio: PropTypes.bool,
  allowNewSelection: PropTypes.bool,
  disabled: PropTypes.bool,
  styles: PropTypes.object,
  onImgLoad: PropTypes.func,
  beforeImgLoad: PropTypes.func,
  onChange: PropTypes.func
};

Cropper.defaultProps = {
  width: 200,
  height: 200,
  fixedRatio: true,
  allowNewSelection: true,
  ratio: 1,
  originX: 0,
  originY: 0,
  styles: {},
  onImgLoad: function onImgLoad() {},
  beforeImgLoad: function beforeImgLoad() {}

  /*
  default inline styles
  */
};var defaultStyles = {
  container: {},
  img: {
    userDrag: 'none',
    userSelect: 'none',
    MozUserSelect: 'none',
    WebkitUserDrag: 'none',
    WebkitUserSelect: 'none',
    WebkitTransform: 'translateZ(0)',
    WebkitPerspective: 1000,
    WebkitBackfaceVisibility: 'hidden'
  },

  clone: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'absolute',
    left: 0,
    top: 0
  },

  frame: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    display: 'none'
  },

  dragging_frame: {
    opacity: 0.8
  },

  source: {
    overflow: 'hidden'
  },

  source_img: {
    float: 'left'
  },

  modal: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    opacity: 0.4,
    backgroundColor: '#000'
  },
  modal_disabled: {
    backgroundColor: '#666',
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  move: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    cursor: 'move',
    outline: '1px dashed #88f',
    backgroundColor: 'transparent'
  },

  dot: {
    zIndex: 10
  },
  dotN: {
    cursor: 'n-resize'
  },
  dotS: {
    cursor: 's-resize'
  },
  dotE: {
    cursor: 'e-resize'
  },
  dotW: {
    cursor: 'w-resize'
  },
  dotNW: {
    cursor: 'nw-resize'
  },
  dotNE: {
    cursor: 'ne-resize'
  },
  dotSW: {
    cursor: 'sw-resize'
  },
  dotSE: {
    cursor: 'se-resize'
  },
  dotCenter: {
    backgroundColor: 'transparent',
    cursor: 'move'
  },

  dotInner: {
    border: '1px solid #88f',
    background: '#fff',
    display: 'block',
    width: 6,
    height: 6,
    padding: 0,
    margin: 0,
    position: 'absolute'
  },

  dotInnerN: {
    top: -4,
    left: '50%',
    marginLeft: -4
  },
  dotInnerS: {
    bottom: -4,
    left: '50%',
    marginLeft: -4
  },
  dotInnerE: {
    right: -4,
    top: '50%',
    marginTop: -4
  },
  dotInnerW: {
    left: -4,
    top: '50%',
    marginTop: -4
  },
  dotInnerNE: {
    top: -4,
    right: -4
  },
  dotInnerSE: {
    bottom: -4,
    right: -4
  },
  dotInnerNW: {
    top: -4,
    left: -4
  },
  dotInnerSW: {
    bottom: -4,
    left: -4
  },
  dotInnerCenterVertical: {
    position: 'absolute',
    border: 'none',
    width: 2,
    height: 8,
    backgroundColor: '#88f',
    top: '50%',
    left: '50%',
    marginLeft: -1,
    marginTop: -4
  },
  dotInnerCenterHorizontal: {
    position: 'absolute',
    border: 'none',
    width: 8,
    height: 2,
    backgroundColor: '#88f',
    top: '50%',
    left: '50%',
    marginLeft: -4,
    marginTop: -1
  },

  line: {
    position: 'absolute',
    display: 'block',
    zIndex: 100
  },

  lineS: {
    cursor: 's-resize',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 4,
    background: 'transparent'
  },
  lineN: {
    cursor: 'n-resize',
    top: 0,
    left: 0,
    width: '100%',
    height: 4,
    background: 'transparent'
  },
  lineE: {
    cursor: 'e-resize',
    right: 0,
    top: 0,
    width: 4,
    height: '100%',
    background: 'transparent'
  },
  lineW: {
    cursor: 'w-resize',
    left: 0,
    top: 0,
    width: 4,
    height: '100%',
    background: 'transparent'
  }
};

module.exports = Cropper;