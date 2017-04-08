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
        var _props = this.props;
        var originX = _props.originX;
        var originY = _props.originY;
        var width = _props.width;
        var height = _props.height;
        var fixedRatio = _props.fixedRatio;
        var rate = _props.rate;
        var styles = _props.styles;
        var imageLoaded = _props.imageLoaded;

        return {
            img_width: '100%',
            img_height: 'auto',
            cropWidth: 200,
            cropHeight: 200,
            cropTop: 0,
            cropLeft: 0,
            originX: originX,
            originY: originY,
            startX: 0,
            startY: 0,
            frameWidth: width,
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
            var _props2 = _this.props;
            var originX = _props2.originX;
            var originY = _props2.originY;
            var disabled = _props2.disabled;

            if (disabled) return;
            var _state = _this.state;
            var img_width = _state.img_width;
            var img_height = _state.img_height;
            var _state2 = _this.state;
            var frameWidth = _state2.frameWidth;
            var frameHeight = _state2.frameHeight;


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
        var _state3 = this.state;
        var img_width = _state3.img_width;
        var img_height = _state3.img_height;
        var _props3 = this.props;
        var rate = _props3.rate;
        var fixedRatio = _props3.fixedRatio;
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

        this.setState({ cropLeft: left, cropTop: top, cropWidth: width, cropHeight: height });
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

    // create a new frame
    createNewFrame: function createNewFrame(e) {
        if (this.state.dragging) {
            // click or touch event
            var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
            var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
            var _props4 = this.props;
            var rate = _props4.rate;
            var fixedRatio = _props4.fixedRatio;
            var _state4 = this.state;
            var frameWidth = _state4.frameWidth;
            var frameHeight = _state4.frameHeight;
            var startX = _state4.startX;
            var startY = _state4.startY;
            var offsetLeft = _state4.offsetLeft;
            var offsetTop = _state4.offsetTop;

            // click or touch point's offset from source image top

            var _x = pageX - startX;
            var _y = pageY - startY;

            var _width = frameWidth + Math.abs(_x),
                _height = fixedRatio ? (frameWidth + Math.abs(_x)) / rate : frameHeight + Math.abs(_y),
                _left = offsetLeft,
                _top = offsetTop;

            if (_y < 0) {
                // drag and resize to top, top changing
                _top = fixedRatio ? offsetTop - Math.abs(_x) / rate : offsetTop - Math.abs(_y);
            }

            if (_x < 0) {
                // drag and resize, go to left, left changing
                _left = offsetLeft + _x;
            }
            // calc position
            return this.calcPosition(_width, _height, _left, _top);
        }
    },
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
        var _state5 = this.state;
        var originX = _state5.originX;
        var originY = _state5.originY;
        var startX = _state5.startX;
        var startY = _state5.startY;
        var frameWidth = _state5.frameWidth;
        var frameHeight = _state5.frameHeight;
        var maxLeft = _state5.maxLeft;
        var maxTop = _state5.maxTop;

        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        var _x = pageX - startX + originX;
        var _y = pageY - startY + originY;
        if (pageX < 0 || pageY < 0) return false;

        if (_x > maxLeft) _x = maxLeft;
        if (_y > maxTop) _y = maxTop;
        // frame width, frame height not change, top and left changing
        this.calcPosition(frameWidth, frameHeight, _x, _y);
    },


    // starting draging
    handleDragStart: function handleDragStart(e) {
        var _this3 = this;

        var allowNewSelection = this.props.allowNewSelection;

        var action = e.target.getAttribute('data-action') ? e.target.getAttribute('data-action') : e.target.parentNode.getAttribute('data-action');
        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;

        // if drag or move or allow new selection, change startX, startY, draging state
        if (action || allowNewSelection) {
            e.preventDefault();
            this.setState({
                startX: pageX,
                startY: pageY,
                dragging: true,
                action: action
            });
        }
        // create frame
        if (!action && allowNewSelection) {
            (function () {
                var container = ReactDOM.findDOMNode(_this3.refs.container);
                var offsetLeft = container.offsetLeft;
                var offsetTop = container.offsetTop;


                _this3.setState({
                    // set offset left and top of new frame 
                    offsetLeft: pageX - offsetLeft,
                    offsetTop: pageY - offsetTop,
                    frameWidth: 2,
                    frameHeight: 2
                }, function () {
                    return _this3.calcPosition(2, 2, pageX - offsetLeft, pageY - offsetTop);
                });
            })();
        }
    },


    // stop draging
    handleDragStop: function handleDragStop(e) {
        if (this.state.dragging) {
            e.preventDefault();
            var frameNode = ReactDOM.findDOMNode(this.refs.frameNode);
            var offsetLeft = frameNode.offsetLeft;
            var offsetTop = frameNode.offsetTop;
            var offsetWidth = frameNode.offsetWidth;
            var offsetHeight = frameNode.offsetHeight;
            var _state6 = this.state;
            var img_width = _state6.img_width;
            var img_height = _state6.img_height;

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
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        var _props5 = this.props;
        var width = _props5.width;
        var height = _props5.height;
        var originX = _props5.originX;
        var originY = _props5.originY;


        if (width !== newProps.width || height !== newProps.height || originX !== newProps.originX || originY !== newProps.originY) {
            this.updateFrame(newProps.width, newProps.height, newProps.originX, newProps.originY);
        }
    },
    frameDotMove: function frameDotMove(dir, e) {
        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        var _props6 = this.props;
        var rate = _props6.rate;
        var fixedRatio = _props6.fixedRatio;
        var _state7 = this.state;
        var startX = _state7.startX;
        var startY = _state7.startY;
        var originX = _state7.originX;
        var originY = _state7.originY;
        var frameWidth = _state7.frameWidth;
        var frameHeight = _state7.frameHeight;


        if (pageY !== 0 && pageX !== 0) {
            var _x = pageX - startX;
            var _y = pageY - startY;

            var new_width = frameWidth + _x;
            var new_height = fixedRatio ? new_width : frameHeight + _y;
            switch (dir) {
                case 'ne':
                    new_height = frameHeight - _y;
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : new_height, originX, fixedRatio ? originY - _x / rate : originY + _y);
                case 'e':
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : frameHeight, originX, fixedRatio ? originY - _x / rate * 0.5 : originY);
                case 'se':
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : new_height, originX, originY);
                case 'n':
                    new_height = frameHeight - _y;
                    return this.calcPosition(fixedRatio ? new_height * rate : frameWidth, new_height, fixedRatio ? originX + _y * rate * 0.5 : originX, originY + _y);
                case 'nw':
                    new_width = frameWidth - _x;
                    new_height = frameHeight - _y;
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : new_height, originX + _x, fixedRatio ? originY + _x / rate : originY + _y);
                case 'w':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : frameHeight, originX + _x, fixedRatio ? originY + _x / rate * 0.5 : originY);
                case 'sw':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, fixedRatio ? new_width / rate : new_height, originX + _x, originY);
                case 's':
                    new_height = frameHeight + _y;
                    return this.calcPosition(fixedRatio ? new_height * rate : frameWidth, new_height, fixedRatio ? originX - _y * rate * 0.5 : originX, originY);
                default:
                    return;
            }
        }
    },
    crop: function crop() {
        var _state8 = this.state;
        var frameWidth = _state8.frameWidth;
        var frameHeight = _state8.frameHeight;
        var originX = _state8.originX;
        var originY = _state8.originY;
        var img_width = _state8.img_width;

        var canvas = document.createElement('canvas');
        var img = ReactDOM.findDOMNode(this.refs.img);
        var _rate = img.naturalWidth / img_width;
        var realFrameWidth = frameWidth * _rate;
        var realFrameHeight = frameHeight * _rate;
        var realOriginX = originX * _rate;
        var realOriginY = originY * _rate;

        canvas.width = frameWidth;
        canvas.height = frameHeight;

        canvas.getContext("2d").drawImage(img, realOriginX, realOriginY, realFrameWidth, realFrameHeight, 0, 0, frameWidth, frameHeight);
        return canvas.toDataURL();
    },
    values: function values() {
        var _state9 = this.state;
        var frameWidth = _state9.frameWidth;
        var frameHeight = _state9.frameHeight;
        var originX = _state9.originX;
        var originY = _state9.originY;
        var img_width = _state9.img_width;
        var img_height = _state9.img_height;

        return { width: frameWidth, height: frameHeight, x: originX, y: originY, imgWidth: img_width, imgHeight: img_height };
    },
    render: function render() {
        var _state10 = this.state;
        var dragging = _state10.dragging;
        var img_height = _state10.img_height;
        var img_width = _state10.img_width;
        var imgBeforeLoaded = _state10.imgBeforeLoaded;
        var styles = _state10.styles;
        var _props7 = this.props;
        var src = _props7.src;
        var disabled = _props7.disabled;


        var imageNode = React.createElement(
            'div',
            { style: styles.source, ref: 'sourceNode' },
            React.createElement('img', { crossOrigin: 'anonymous',
                src: src,
                style: deepExtend({}, styles.img, styles.source_img),
                ref: 'img',
                onLoad: this.imgOnLoad,
                width: img_width, height: img_height
            })
        );

        if (disabled) {
            return React.createElement(
                'div',
                { ref: 'container', style: deepExtend({}, styles.container, {
                        'position': 'relative',
                        'height': img_height
                    }) },
                imageNode,
                React.createElement('div', { style: deepExtend({}, styles.modal, styles.modal_disabled) })
            );
        }

        return React.createElement(
            'div',
            { ref: 'container',
                onMouseDown: this.handleDragStart, onTouchStart: this.handleDragStart,
                style: deepExtend({}, styles.container, {
                    'position': 'relative',
                    'height': img_height
                }) },
            imageNode,
            imgBeforeLoaded ? React.createElement(
                'div',
                null,
                React.createElement('div', { style: styles.modal }),
                React.createElement(
                    'div',
                    { style: deepExtend({}, styles.frame, dragging ? styles.dragging_frame : {}, {
                            display: 'block',
                            left: this.state.cropLeft,
                            top: this.state.cropTop,
                            width: this.state.cropWidth,
                            height: this.state.cropHeight
                        }), ref: 'frameNode' },
                    React.createElement(
                        'div',
                        { style: styles.clone },
                        React.createElement('img', {
                            crossOrigin: 'anonymous',
                            src: src,
                            style: deepExtend({}, styles.img, {
                                marginLeft: -this.state.cropLeft,
                                marginTop: -this.state.cropTop
                            }),
                            ref: 'cloneImg',
                            width: img_width,
                            height: img_height
                        })
                    ),
                    React.createElement('span', { style: styles.move, 'data-action': 'move' }),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotCenter),
                            'data-action': 'move' },
                        React.createElement('span', {
                            style: deepExtend({}, styles.dotInner, styles.dotInnerCenterVertical) }),
                        React.createElement('span', {
                            style: deepExtend({}, styles.dotInner, styles.dotInnerCenterHorizontal) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotNE),
                            'data-action': 'ne' },
                        React.createElement('span', {
                            style: deepExtend({}, styles.dotInner, styles.dotInnerNE) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotN),
                            'data-action': 'n' },
                        React.createElement('span', {
                            style: deepExtend({}, styles.dotInner, styles.dotInnerN) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotNW),
                            'data-action': 'nw' },
                        React.createElement('span', {
                            style: deepExtend({}, styles.dotInner, styles.dotInnerNW) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotE),
                            'data-action': 'e' },
                        React.createElement('span', {
                            style: deepExtend({}, styles.dotInner, styles.dotInnerE) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotW),
                            'data-action': 'w' },
                        React.createElement('span', {
                            style: deepExtend({}, styles.dotInner, styles.dotInnerW) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotSE),
                            'data-action': 'se' },
                        React.createElement('span', {
                            style: deepExtend({}, styles.dotInner, styles.dotInnerSE) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotS),
                            'data-action': 's' },
                        React.createElement('span', {
                            style: deepExtend({}, styles.dotInner, styles.dotInnerS) })
                    ),
                    React.createElement(
                        'span',
                        { style: deepExtend({}, styles.dot, styles.dotSW),
                            'data-action': 'sw' },
                        React.createElement('span', {
                            style: deepExtend({}, styles.dotInner, styles.dotInnerSW) })
                    ),
                    React.createElement('span', { style: deepExtend({}, styles.line, styles.lineN),
                        'data-action': 'n' }),
                    React.createElement('span', { style: deepExtend({}, styles.line, styles.lineS),
                        'data-action': 's' }),
                    React.createElement('span', { style: deepExtend({}, styles.line, styles.lineW),
                        'data-action': 'w' }),
                    React.createElement('span', { style: deepExtend({}, styles.line, styles.lineE),
                        'data-action': 'e' })
                )
            ) : null
        );
    }
});

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