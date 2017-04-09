'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var deepExtend = require('deep-extend');

var Cropper = React.createClass({
    displayName: 'Cropper',

    PropTypes: {
        src: React.PropTypes.string.isRequired,
        originX: React.PropTypes.number,
        originY: React.PropTypes.number,
        rate: React.PropTypes.number,
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        fixedRatio: React.PropTypes.bool,
        allowNewSelection: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        styles: React.PropTypes.object,
        imageLoaded: React.PropTypes.function,
        beforeImageLoaded: React.PropTypes.function
    },
    getDefaultProps: function getDefaultProps() {
        return {
            width: 200,
            height: 200,
            fixedRatio: true,
            allowNewSelection: true,
            rate: 1,
            originX: 0,
            originY: 0,
            styles: {},
            imageLoaded: function imageLoaded() {},
            beforeImageLoaded: function beforeImageLoaded() {}
        };
    },
    getInitialState: function getInitialState() {
        var _props = this.props,
            originX = _props.originX,
            originY = _props.originY,
            width = _props.width,
            height = _props.height,
            fixedRatio = _props.fixedRatio,
            rate = _props.rate,
            styles = _props.styles,
            imageLoaded = _props.imageLoaded;

        return {
            // background image width
            img_width: '100%',
            // background image height
            img_height: 'auto',
            // cropper width, drag trigger changing
            frameWidth4Style: width,
            // cropper height, drag trigger changing
            frameHeight4Style: fixedRatio ? width / rate : height,
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
            frameHeight: fixedRatio ? width / rate : height,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
            action: null,
            imgBeforeLoaded: false,
            styles: deepExtend({}, defaultStyles, styles)
        };
    },

    // initialize style, component did mount or component updated.
    initStyles: function initStyles() {
        var _this = this;

        var container = ReactDOM.findDOMNode(this.refs.container);
        this.setState({
            img_width: container.offsetWidth
        }, function () {
            // calc frame width height
            var _props2 = _this.props,
                originX = _props2.originX,
                originY = _props2.originY,
                disabled = _props2.disabled;

            if (disabled) return;
            var _state = _this.state,
                img_width = _state.img_width,
                img_height = _state.img_height;
            var _state2 = _this.state,
                frameWidth = _state2.frameWidth,
                frameHeight = _state2.frameHeight;


            var maxLeft = img_width - frameWidth;
            var maxTop = img_height - frameHeight;

            if (originX + frameWidth >= img_width) {
                originX = img_width - frameWidth;
                _this.setState({ originX: originX });
            }
            if (originY + frameHeight >= img_height) {
                originY = img_height - frameHeight;
                _this.setState({ originY: originY });
            }

            _this.setState({ maxLeft: maxLeft, maxTop: maxTop });
            // calc clone position
            _this.calcPosition(frameWidth, frameHeight, originX, originY);
        });
    },


    // props change, update frame
    updateFrame: function updateFrame(frameWidth, frameHeight, originX, originY) {
        var _this2 = this;

        this.setState({ frameWidth: frameWidth, frameHeight: frameHeight, originX: originX, originY: originY }, function () {
            return _this2.initStyles();
        });
    },


    // frame width, frame height, position left, position top
    calcPosition: function calcPosition(width, height, left, top, move) {
        var _state3 = this.state,
            img_width = _state3.img_width,
            img_height = _state3.img_height;
        var _props3 = this.props,
            rate = _props3.rate,
            fixedRatio = _props3.fixedRatio;
        // width < 0 or height < 0, frame invalid

        if (width < 0 || height < 0) return false;

        // if ratio is fixed
        if (fixedRatio) {
            // adjust by width
            if (width / img_width > height / img_height) {
                if (width > img_width) {
                    width = img_width;
                    left = 0;
                    height = width / rate;
                }
            } else {
                // adjust by height
                if (height > img_height) {
                    height = img_height;
                    top = 0;
                    width = height * rate;
                }
            }
        }

        // frame width plus offset left, larger than img's width
        if (width + left > img_width) {
            if (fixedRatio) {
                // if fixed ratio, adjust left with width
                left = img_width - width;
            } else {
                // resize width with left
                width = width - (width + left - img_width);
            }
        }

        // frame heigth plust offset top, larger than img's height
        if (height + top > img_height) {
            if (fixedRatio) {
                // if fixed ratio, adjust top with height
                top = img_height - height;
            } else {
                // resize height with top
                height = height - (height + top - img_height);
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
        if (width > img_width) {
            width = img_width;
        }
        // if frame height larger than img height
        if (height > img_height) {
            height = img_height;
        }

        this.setState({ toImgLeft4Style: left, toImgTop4Style: top, frameWidth4Style: width, frameHeight4Style: height });
    },


    // image onloaded hook
    imgOnLoad: function imgOnLoad() {
        this.props.imageLoaded();
    },


    // adjust image height when image size scaleing change, also initialize styles
    imgGetSizeBeforeLoad: function imgGetSizeBeforeLoad() {
        var that = this;
        // trick way to get naturalwidth of image after component did mount
        setTimeout(function () {
            var img = ReactDOM.findDOMNode(that.refs.img);
            if (img && img.naturalWidth) {
                var beforeImageLoaded = that.props.beforeImageLoaded;

                // image scaleing

                var _heightRatio = img.offsetWidth / img.naturalWidth;
                var height = parseInt(img.naturalHeight * _heightRatio);

                that.setState({
                    img_height: height,
                    imgBeforeLoaded: true
                }, function () {
                    return that.initStyles();
                });
                // before image loaded hook
                beforeImageLoaded();
            } else if (img) {
                // catch if image naturalwidth is 0
                that.imgGetSizeBeforeLoad();
            }
        }, 0);
    },

    // create a new frame, and drag, so frame width and height is became larger.
    createNewFrame: function createNewFrame(e) {
        if (this.state.dragging) {
            // click or touch event
            var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
            var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
            var _props4 = this.props,
                rate = _props4.rate,
                fixedRatio = _props4.fixedRatio;
            var _state4 = this.state,
                frameWidth = _state4.frameWidth,
                frameHeight = _state4.frameHeight,
                startPageX = _state4.startPageX,
                startPageY = _state4.startPageY,
                originX = _state4.originX,
                originY = _state4.originY;

            // click or touch point's offset from source image top

            var _x = pageX - startPageX;
            var _y = pageY - startPageY;

            // frame new width, height, left, top
            var _width = frameWidth + Math.abs(_x);
            var _height = fixedRatio ? (frameWidth + Math.abs(_x)) / rate : frameHeight + Math.abs(_y);
            var _left = originX;
            var _top = originY;

            if (_y < 0) {
                // drag and resize to top, top changing
                _top = fixedRatio ? originY - Math.abs(_x) / rate : originY - Math.abs(_y);
            }

            if (_x < 0) {
                // drag and resize, go to left, left changing
                _left = originX + _x;
            }
            // calc position
            return this.calcPosition(_width, _height, _left, _top);
        }
    },


    // judge whether to create new frame, frame or frame dot move acroding to action
    handleDrag: function handleDrag(e) {
        if (this.state.dragging) {
            e.preventDefault();
            var action = this.state.action;

            if (!action) return this.createNewFrame(e);
            if (action == 'move') return this.frameMove(e);
            this.frameDotMove(action, e);
        }
    },


    // frame move handler
    frameMove: function frameMove(e) {
        var _state5 = this.state,
            originX = _state5.originX,
            originY = _state5.originY,
            startPageX = _state5.startPageX,
            startPageY = _state5.startPageY,
            frameWidth = _state5.frameWidth,
            frameHeight = _state5.frameHeight,
            maxLeft = _state5.maxLeft,
            maxTop = _state5.maxTop;

        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        var _x = pageX - startPageX + originX;
        var _y = pageY - startPageY + originY;
        if (pageX < 0 || pageY < 0) return false;

        if (_x > maxLeft) _x = maxLeft;
        if (_y > maxTop) _y = maxTop;
        // frame width, frame height not change, top and left changing
        this.calcPosition(frameWidth, frameHeight, _x, _y);
    },


    // starting dragging
    handleDragStart: function handleDragStart(e) {
        var _this3 = this;

        var allowNewSelection = this.props.allowNewSelection;

        var action = e.target.getAttribute('data-action') ? e.target.getAttribute('data-action') : e.target.parentNode.getAttribute('data-action');

        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;

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
            var container = ReactDOM.findDOMNode(this.refs.container);
            var offsetLeft = container.offsetLeft,
                offsetTop = container.offsetTop;


            this.setState({
                // set offset left and top of new frame 
                originX: pageX - offsetLeft,
                originY: pageY - offsetTop,
                frameWidth: 2,
                frameHeight: 2
            }, function () {
                return _this3.calcPosition(2, 2, pageX - offsetLeft, pageY - offsetTop);
            });
        }
    },


    // stop dragging
    handleDragStop: function handleDragStop(e) {
        if (this.state.dragging) {
            e.preventDefault();
            var frameNode = ReactDOM.findDOMNode(this.refs.frameNode);
            var offsetLeft = frameNode.offsetLeft,
                offsetTop = frameNode.offsetTop,
                offsetWidth = frameNode.offsetWidth,
                offsetHeight = frameNode.offsetHeight;
            var _state6 = this.state,
                img_width = _state6.img_width,
                img_height = _state6.img_height;

            this.setState({
                originX: offsetLeft,
                originY: offsetTop,
                dragging: false,
                frameWidth: offsetWidth,
                frameHeight: offsetHeight,
                maxLeft: img_width - offsetWidth,
                maxTop: img_height - offsetHeight,
                action: null
            });
        }
    },
    componentDidMount: function componentDidMount() {
        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('touchmove', this.handleDrag);

        document.addEventListener('mouseup', this.handleDragStop);
        document.addEventListener('touchend', this.handleDragStop);

        this.imgGetSizeBeforeLoad();
    },
    componentWillUnmount: function componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('touchmove', this.handleDrag);

        document.removeEventListener('mouseup', this.handleDragStop);
        document.removeEventListener('touchend', this.handleDragStop);
    },


    // props change to update frame
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        var _props5 = this.props,
            width = _props5.width,
            height = _props5.height,
            originX = _props5.originX,
            originY = _props5.originY;


        if (width !== newProps.width || height !== newProps.height || originX !== newProps.originX || originY !== newProps.originY) {
            this.updateFrame(newProps.width, newProps.height, newProps.originX, newProps.originY);
        }
    },


    // drag dot to different direction
    frameDotMove: function frameDotMove(dir, e) {
        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        var _props6 = this.props,
            rate = _props6.rate,
            fixedRatio = _props6.fixedRatio;
        var _state7 = this.state,
            startPageX = _state7.startPageX,
            startPageY = _state7.startPageY,
            originX = _state7.originX,
            originY = _state7.originY,
            frameWidth = _state7.frameWidth,
            frameHeight = _state7.frameHeight;


        if (pageY !== 0 && pageX !== 0) {
            // current drag position offset x and y to first drag start position
            var _x = pageX - startPageX;
            var _y = pageY - startPageY;

            var _width = 0;
            var _height = 0;
            var _top = 0;
            var _left = 0;
            // have not abstract, just calc width, height, left, top in each direction
            switch (dir) {
                case 'ne':
                    _width = frameWidth + _x;
                    _height = fixedRatio ? _width / rate : frameHeight + _y;
                    _left = originX;
                    _top = fixedRatio ? originY - _x / rate : originY + _y;
                    break;
                case 'e':
                    _width = frameWidth + _x;
                    _height = fixedRatio ? _width / rate : frameHeight;
                    _left = originX;
                    _top = fixedRatio ? originY - _x / rate * 0.5 : originY;
                    break;
                case 'se':
                    _width = frameWidth + _x;
                    _height = fixedRatio ? _width / rate : frameHeight + _y;
                    _left = originX;
                    _top = originY;
                    break;
                case 'n':
                    _height = frameHeight - _y;
                    _width = fixedRatio ? _height * rate : frameWidth;
                    _left = fixedRatio ? originX + _y * rate * 0.5 : originX;
                    _top = originY + _y;
                    break;
                case 'nw':
                    _width = frameWidth - _x;
                    _height = fixedRatio ? _width / rate : frameHeight - _y;
                    _left = originX + _x;
                    _top = fixedRatio ? originY + _x / rate : originY + _y;
                    break;
                case 'w':
                    _width = frameWidth - _x;
                    _height = fixedRatio ? _width / rate : frameHeight;
                    _left = originX + _x;
                    _top = fixedRatio ? originY + _x / rate * 0.5 : originY;
                    break;
                case 'sw':
                    _width = frameWidth - _x;
                    _height = fixedRatio ? _width / rate : frameHeight + _y;
                    _left = originX + _x;
                    _top = originY;
                    break;
                case 's':
                    _height = frameHeight + _y;
                    _width = fixedRatio ? _height * rate : frameWidth;
                    _left = fixedRatio ? originX - _y * rate * 0.5 : originX;
                    _top = originY;
                    break;
                default:
                    break;
            }
            return this.calcPosition(_width, _height, _left, _top);
        }
    },


    // crop image
    crop: function crop() {
        var _state8 = this.state,
            frameWidth = _state8.frameWidth,
            frameHeight = _state8.frameHeight,
            originX = _state8.originX,
            originY = _state8.originY,
            img_width = _state8.img_width;

        var canvas = document.createElement('canvas');
        var img = ReactDOM.findDOMNode(this.refs.img);
        // crop accroding image's natural width
        var _scale = img.naturalWidth / img_width;
        var realFrameWidth = frameWidth * _scale;
        var realFrameHeight = frameHeight * _scale;
        var realOriginX = originX * _scale;
        var realOriginY = originY * _scale;

        canvas.width = frameWidth;
        canvas.height = frameHeight;

        canvas.getContext("2d").drawImage(img, realOriginX, realOriginY, realFrameWidth, realFrameHeight, 0, 0, frameWidth, frameHeight);
        return canvas.toDataURL();
    },
    values: function values() {
        var _state9 = this.state,
            frameWidth = _state9.frameWidth,
            frameHeight = _state9.frameHeight,
            originX = _state9.originX,
            originY = _state9.originY,
            img_width = _state9.img_width,
            img_height = _state9.img_height;

        return { width: frameWidth, height: frameHeight, x: originX, y: originY, imgWidth: img_width, imgHeight: img_height };
    },
    render: function render() {
        var _state10 = this.state,
            dragging = _state10.dragging,
            img_height = _state10.img_height,
            img_width = _state10.img_width,
            imgBeforeLoaded = _state10.imgBeforeLoaded,
            styles = _state10.styles;
        var _props7 = this.props,
            src = _props7.src,
            disabled = _props7.disabled;


        var imageNode = React.createElement(
            'div',
            { style: styles.source, ref: 'sourceNode' },
            React.createElement('img', { crossOrigin: 'anonymous',
                src: src, ref: 'img',
                style: deepExtend({}, styles.img, styles.source_img),
                onLoad: this.imgOnLoad,
                width: img_width, height: img_height })
        );
        // disabled cropper
        if (disabled) {
            return React.createElement(
                'div',
                { style: deepExtend({}, styles.container, {
                        'position': 'relative',
                        'height': img_height
                    }),
                    ref: 'container' },
                imageNode,
                React.createElement('div', { style: deepExtend({}, styles.modal, styles.modal_disabled) })
            );
        }

        return React.createElement(
            'div',
            { onMouseDown: this.handleDragStart, onTouchStart: this.handleDragStart,
                style: deepExtend({}, styles.container, {
                    'position': 'relative',
                    'height': img_height
                }),
                ref: 'container' },
            imageNode,
            imgBeforeLoaded ? React.createElement(
                'div',
                null,
                React.createElement('div', { style: styles.modal }),
                React.createElement(
                    'div',
                    { style: deepExtend({}, styles.frame, dragging ? styles.dragging_frame : {}, {
                            display: 'block',
                            left: this.state.toImgLeft4Style,
                            top: this.state.toImgTop4Style,
                            width: this.state.frameWidth4Style,
                            height: this.state.frameHeight4Style
                        }),
                        ref: 'frameNode' },
                    React.createElement(
                        'div',
                        { style: styles.clone },
                        React.createElement('img', { src: src, crossOrigin: 'anonymous',
                            width: img_width, height: img_height,
                            style: deepExtend({}, styles.img, {
                                marginLeft: -this.state.toImgLeft4Style,
                                marginTop: -this.state.toImgTop4Style
                            }),
                            ref: 'cloneImg' })
                    ),
                    React.createElement('span', { style: styles.move, 'data-action': 'move' }),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotCenter), 'data-action': 'move' },
                        React.createElement('span', { style: deepExtend({}, styles.dotInner, styles.dotInnerCenterVertical) }),
                        React.createElement('span', { style: deepExtend({}, styles.dotInner, styles.dotInnerCenterHorizontal) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotNE), 'data-action': 'ne' },
                        React.createElement('span', { style: deepExtend({}, styles.dotInner, styles.dotInnerNE) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotN), 'data-action': 'n' },
                        React.createElement('span', { style: deepExtend({}, styles.dotInner, styles.dotInnerN) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotNW), 'data-action': 'nw' },
                        React.createElement('span', { style: deepExtend({}, styles.dotInner, styles.dotInnerNW) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotE), 'data-action': 'e' },
                        React.createElement('span', { style: deepExtend({}, styles.dotInner, styles.dotInnerE) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotW), 'data-action': 'w' },
                        React.createElement('span', { style: deepExtend({}, styles.dotInner, styles.dotInnerW) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotSE), 'data-action': 'se' },
                        React.createElement('span', { style: deepExtend({}, styles.dotInner, styles.dotInnerSE) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotS), 'data-action': 's' },
                        React.createElement('span', { style: deepExtend({}, styles.dotInner, styles.dotInnerS) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotSW), 'data-action': 'sw' },
                        React.createElement('span', { style: deepExtend({}, styles.dotInner, styles.dotInnerSW) })
                    ),
                    React.createElement('span', { style: deepExtend({}, styles.line, styles.lineN), 'data-action': 'n' }),
                    React.createElement('span', { style: deepExtend({}, styles.line, styles.lineS), 'data-action': 's' }),
                    React.createElement('span', { style: deepExtend({}, styles.line, styles.lineW), 'data-action': 'w' }),
                    React.createElement('span', { style: deepExtend({}, styles.line, styles.lineE), 'data-action': 'e' })
                )
            ) : null
        );
    }
});

/*
default inline styles
*/
var defaultStyles = {
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
        opacity: .8
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
        opacity: .4,
        backgroundColor: '#222'
    },
    modal_disabled: {
        backgroundColor: '#666',
        opacity: .7,
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