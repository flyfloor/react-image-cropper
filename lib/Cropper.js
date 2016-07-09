'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var objectAssign = require('object-assign');

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
        disabled: React.PropTypes.bool
    },
    getDefaultProps: function getDefaultProps() {
        return {
            width: 200,
            height: 200,
            fixedRatio: true,
            allowNewSelection: true,
            rate: 1,
            originX: 0,
            originY: 0
        };
    },
    getInitialState: function getInitialState() {
        var _props = this.props;
        var originX = _props.originX;
        var originY = _props.originY;
        var width = _props.width;
        var height = _props.height;
        var fixedRatio = _props.fixedRatio;
        var allowNewSelection = _props.allowNewSelection;
        var rate = _props.rate;

        return {
            img_width: '100%',
            img_height: 'auto',
            imgWidth: 200,
            imgheight: 200,
            imgTop: 0,
            imgLeft: 0,
            originX: originX,
            originY: originY,
            startX: 0,
            startY: 0,
            frameWidth: width,
            fixedRatio: fixedRatio,
            allowNewSelection: allowNewSelection,
            frameHeight: fixedRatio ? width / rate : height,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
            action: null,
            imgLoaded: false
        };
    },
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
            var frameWidth = _state.frameWidth;
            var frameHeight = _state.frameHeight;

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

            _this.setState({ maxLeft: maxLeft, maxTop: maxTop, imgLoaded: true });
            // calc clone position
            _this.calcPosition(frameWidth, frameHeight, originX, originY);
        });
    },
    calcPosition: function calcPosition(width, height, left, top, move) {
        var frameNode = ReactDOM.findDOMNode(this.refs.frameNode);
        var cloneImg = ReactDOM.findDOMNode(this.refs.cloneImg);
        var _state2 = this.state;
        var img_width = _state2.img_width;
        var img_height = _state2.img_height;
        var fixedRatio = _state2.fixedRatio;
        var _props3 = this.props;
        var src = _props3.src;
        var disabled = _props3.disabled;
        var rate = _props3.rate;


        if (width < 0 || height < 0) return false;
        if (fixedRatio) {
            if (width / img_width > height / img_height) {
                if (width > img_width) {
                    width = img_width;
                    left = 0;
                    if (fixedRatio) {
                        height = width / rate;
                    }
                }
            } else {
                if (height > img_height) {
                    height = img_height;
                    top = 0;
                    if (fixedRatio) {
                        width = height * rate;
                    }
                }
            }
        }

        if (width + left > img_width) {
            if (fixedRatio) {
                left = img_width - width;
            } else {
                width = width - (width + left - img_width);
            }
        }

        if (height + top > img_height) {
            if (fixedRatio) {
                top = img_height - height;
            } else {
                height = height - (height + top - img_height);
            }
        }

        if (left < 0) {
            if (!fixedRatio && !move) {
                width = width + left;
            }
            left = 0;
        }
        if (top < 0) {
            if (!fixedRatio && !move) {
                height = height + top;
            }
            top = 0;
        }

        if (width > img_width) {
            width = img_width;
        }
        if (height > img_height) {
            height = img_height;
        }

        this.setState({ imgLeft: left, imgTop: top, imgWidth: width, imgHeight: height });
    },
    imgOnload: function imgOnload() {
        var _this2 = this;

        var img = ReactDOM.findDOMNode(this.refs.img);
        this.setState({
            img_height: img.offsetHeight
        }, function () {
            return _this2.initStyles();
        });
    },
    createNewFrame: function createNewFrame(e) {
        if (this.state.dragging) {
            var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
            var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
            var rate = this.props.rate;
            var _state3 = this.state;
            var frameWidth = _state3.frameWidth;
            var frameHeight = _state3.frameHeight;
            var startX = _state3.startX;
            var startY = _state3.startY;
            var offsetLeft = _state3.offsetLeft;
            var offsetTop = _state3.offsetTop;
            var fixedRatio = _state3.fixedRatio;


            var _x = pageX - startX;
            var _y = pageY - startY;

            if (_x > 0) {
                if (_y < 0) {
                    return this.calcPosition(frameWidth + _x, fixedRatio ? (frameWidth + _x) / rate : frameHeight - _y, offsetLeft, fixedRatio ? offsetTop - _x / rate : offsetTop + _y);
                }
                return this.calcPosition(frameWidth + _x, fixedRatio ? (frameWidth + _x) / rate : frameHeight + _y, offsetLeft, offsetTop);
            }
            if (_y > 0) {
                return this.calcPosition(frameWidth - _x, fixedRatio ? (frameWidth - _x) / rate : frameHeight + _y, offsetLeft + _x, offsetTop);
            }

            return this.calcPosition(frameWidth - _x, fixedRatio ? (frameWidth - _x) / rate : frameHeight - _y, offsetLeft + _x, fixedRatio ? offsetTop + _x / rate : offsetTop + _y);
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
    frameMove: function frameMove(e) {
        var _state4 = this.state;
        var originX = _state4.originX;
        var originY = _state4.originY;
        var startX = _state4.startX;
        var startY = _state4.startY;
        var frameWidth = _state4.frameWidth;
        var frameHeight = _state4.frameHeight;
        var maxLeft = _state4.maxLeft;
        var maxTop = _state4.maxTop;

        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        var _x = pageX - startX + originX;
        var _y = pageY - startY + originY;
        if (pageX < 0 || pageY < 0) return false;
        if (_x > maxLeft) _x = maxLeft;
        if (_y > maxTop) _y = maxTop;
        this.calcPosition(frameWidth, frameHeight, _x, _y, true);
    },
    handleDragStart: function handleDragStart(e) {
        var _this3 = this;

        var allowNewSelection = this.state.allowNewSelection;

        var action = e.target.getAttribute('data-action') ? e.target.getAttribute('data-action') : e.target.parentNode.getAttribute('data-action');
        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        if (action || allowNewSelection) {
            e.preventDefault();
            this.setState({
                startX: pageX,
                startY: pageY,
                dragging: true,
                action: action
            });
        }
        if (!action && allowNewSelection) {
            (function () {
                var container = ReactDOM.findDOMNode(_this3.refs.container);
                var offsetLeft = container.offsetLeft;
                var offsetTop = container.offsetTop;

                _this3.setState({
                    offsetLeft: pageX - offsetLeft,
                    offsetTop: pageY - offsetTop,
                    frameWidth: 2,
                    frameHeight: 2
                }, function () {
                    _this3.calcPosition(2, 2, pageX - offsetLeft, pageY - offsetTop);
                });
            })();
        }
    },
    handleDragStop: function handleDragStop(e) {
        if (this.state.dragging) {
            e.preventDefault();
            var frameNode = ReactDOM.findDOMNode(this.refs.frameNode);
            var offsetLeft = frameNode.offsetLeft;
            var offsetTop = frameNode.offsetTop;
            var offsetWidth = frameNode.offsetWidth;
            var offsetHeight = frameNode.offsetHeight;
            var _state5 = this.state;
            var img_width = _state5.img_width;
            var img_height = _state5.img_height;

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
    },
    componentWillUnmount: function componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('touchmove', this.handleDrag);

        document.removeEventListener('mouseup', this.handleDragStop);
        document.removeEventListener('touchend', this.handleDragStop);
    },
    frameDotMove: function frameDotMove(dir, e) {
        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        var rate = this.props.rate;
        var _state6 = this.state;
        var startX = _state6.startX;
        var startY = _state6.startY;
        var originX = _state6.originX;
        var originY = _state6.originY;
        var frameWidth = _state6.frameWidth;
        var frameHeight = _state6.frameHeight;
        var img_width = _state6.img_width;
        var img_height = _state6.img_height;
        var fixedRatio = _state6.fixedRatio;


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
        var _state7 = this.state;
        var frameWidth = _state7.frameWidth;
        var frameHeight = _state7.frameHeight;
        var originX = _state7.originX;
        var originY = _state7.originY;
        var img_width = _state7.img_width;
        var src = this.props.src;

        var canvas = document.createElement('canvas');
        var img = ReactDOM.findDOMNode(this.refs.img);
        var _rate = img.naturalWidth / img_width;
        var realWidth = frameWidth * _rate;
        var realHeight = frameHeight * _rate;
        canvas.width = realWidth;
        canvas.height = realHeight;

        canvas.getContext("2d").drawImage(img, originX * _rate, originY * _rate, realWidth, realHeight, 0, 0, realWidth, realHeight);
        return canvas.toDataURL();
    },
    values: function values() {
        var _state8 = this.state;
        var frameWidth = _state8.frameWidth;
        var frameHeight = _state8.frameHeight;
        var originX = _state8.originX;
        var originY = _state8.originY;
        var img_width = _state8.img_width;
        var img_height = _state8.img_height;

        var img = ReactDOM.findDOMNode(this.refs.img);
        var _rateWidth = img.naturalWidth / img_width;
        var _rateHeight = img.naturalHeight / img_height;
        var realWidth = parseInt(frameWidth * _rateWidth);
        var realHeight = parseInt(frameHeight * _rateHeight);
        return { width: realWidth, height: realHeight, x: originX, y: originY };
    },
    render: function render() {
        var className = ['_cropper'];
        var _state9 = this.state;
        var imgLoaded = _state9.imgLoaded;
        var dragging = _state9.dragging;
        var img_height = _state9.img_height;
        var img_width = _state9.img_width;
        var _props4 = this.props;
        var src = _props4.src;
        var disabled = _props4.disabled;


        if (imgLoaded) className.push('_loaded');
        if (dragging) className.push('_dragging');
        className = className.join(' ');
        if (disabled) className = '_cropper _disabled';
        var imageNode = React.createElement(
            'div',
            { style: styles.source, ref: 'sourceNode' },
            React.createElement('img', { src: src, style: objectAssign({}, styles.img, styles.source_img), crossOrigin: true, ref: 'img',
                onLoad: this.imgOnload,
                width: img_width, height: img_height })
        );

        var node = disabled ? React.createElement(
            'div',
            { className: className, ref: 'container', style: { 'position': 'relative', 'height': img_height } },
            imageNode,
            React.createElement('div', { style: objectAssign({}, styles.modal, styles.modal_disabled) })
        ) : React.createElement(
            'div',
            { className: className,
                ref: 'container',
                onMouseDown: this.handleDragStart, onTouchStart: this.handleDragStart,
                style: { 'position': 'relative', 'height': img_height } },
            imageNode,
            React.createElement('div', { style: styles.modal }),
            React.createElement(
                'div',
                { style: objectAssign({}, styles.frame, dragging ? styles.dragging_frame : {}, {
                        display: 'block',
                        left: this.state.imgLeft,
                        top: this.state.imgTop,
                        width: this.state.imgWidth,
                        height: this.state.imgHeight
                    }), ref: 'frameNode' },
                React.createElement(
                    'div',
                    { style: styles.clone },
                    React.createElement('img', { src: src, style: objectAssign({}, styles.img, {
                            marginLeft: -this.state.imgLeft,
                            marginTop: -this.state.imgTop
                        }),
                        crossOrigin: true, ref: 'cloneImg', width: img_width,
                        height: img_height })
                ),
                React.createElement('span', { className: '_move', style: styles.move, 'data-action': 'move' }),
                React.createElement(
                    'span',
                    { style: objectAssign({}, styles.dot, styles.dotCenter),
                        'data-action': 'move' },
                    React.createElement('span', { style: objectAssign({}, styles.dotInner, styles.dotInnerCenterVertical) }),
                    React.createElement('span', { style: objectAssign({}, styles.dotInner, styles.dotInnerCenterHorizontal) })
                ),
                React.createElement(
                    'span',
                    { style: objectAssign({}, styles.dot, styles.dotNE),
                        'data-action': 'ne' },
                    React.createElement('span', { style: objectAssign({}, styles.dotInner, styles.dotInnerNE) })
                ),
                React.createElement(
                    'span',
                    { style: objectAssign({}, styles.dot, styles.dotN),
                        'data-action': 'n' },
                    React.createElement('span', { style: objectAssign({}, styles.dotInner, styles.dotInnerN) })
                ),
                React.createElement(
                    'span',
                    { style: objectAssign({}, styles.dot, styles.dotNW),
                        'data-action': 'nw' },
                    React.createElement('span', { style: objectAssign({}, styles.dotInner, styles.dotInnerNW) })
                ),
                React.createElement(
                    'span',
                    { style: objectAssign({}, styles.dot, styles.dotE),
                        'data-action': 'e' },
                    React.createElement('span', { style: objectAssign({}, styles.dotInner, styles.dotInnerE) })
                ),
                React.createElement(
                    'span',
                    { style: objectAssign({}, styles.dot, styles.dotW),
                        'data-action': 'w' },
                    React.createElement('span', { style: objectAssign({}, styles.dotInner, styles.dotInnerW) })
                ),
                React.createElement(
                    'span',
                    { style: objectAssign({}, styles.dot, styles.dotSE),
                        'data-action': 'se' },
                    React.createElement('span', { style: objectAssign({}, styles.dotInner, styles.dotInnerSE) })
                ),
                React.createElement(
                    'span',
                    { style: objectAssign({}, styles.dot, styles.dotS),
                        'data-action': 's' },
                    React.createElement('span', { style: objectAssign({}, styles.dotInner, styles.dotInnerS) })
                ),
                React.createElement(
                    'span',
                    { style: objectAssign({}, styles.dot, styles.dotSW),
                        'data-action': 'sw' },
                    React.createElement('span', { style: objectAssign({}, styles.dotInner, styles.dotInnerSW) })
                ),
                React.createElement('span', { className: '_line _line-n', style: objectAssign({}, styles.line, styles.lineN),
                    'data-action': 'n' }),
                React.createElement('span', { className: '_line _line-s', style: objectAssign({}, styles.line, styles.lineS),
                    'data-action': 's' }),
                React.createElement('span', { className: '_line _line-w', style: objectAssign({}, styles.line, styles.lineW),
                    'data-action': 'w' }),
                React.createElement('span', { className: '_line _line-e', style: objectAssign({}, styles.line, styles.lineE),
                    'data-action': 'e' })
            )
        );

        return node;
    }
});

var styles = {
    img: {
        userDrag: 'none',
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserDrag: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none'
    },

    clone: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'absolute',
        left: '0',
        top: '0'
    },

    frame: {
        position: 'absolute',
        left: '0',
        top: '0',
        bottom: '0',
        right: '0',
        display: 'none'
    },

    dragging_frame: {
        opacity: '.8'
    },

    source: {
        overflow: 'hidden'
    },

    source_img: {
        float: 'left'
    },

    modal: {
        position: 'absolute',
        left: '0',
        top: '0',
        bottom: '0',
        right: '0',
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
        left: '0',
        top: '0',
        bottom: '0',
        right: '0',
        cursor: 'move',
        outline: '1px dashed #88f',
        backgroundColor: 'transparent'
    },

    dot: {
        zIndex: '10'
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
        backgroundColor: 'transparent'
    },

    dotInner: {
        border: '1px solid #88f',
        background: '#fff',
        display: 'block',
        width: '6px',
        height: '6px',
        padding: '0',
        margin: '0',
        position: 'absolute'
    },

    dotInnerN: {
        top: '-4px',
        left: '50%',
        marginLeft: '-4px'
    },
    dotInnerS: {
        bottom: '-4px',
        left: '50%',
        marginLeft: '-4px'
    },
    dotInnerE: {
        left: '-4px',
        top: '50%',
        marginTop: '-4px'
    },
    dotInnerW: {
        right: '-4px',
        top: '50%',
        marginTop: '-4px'
    },
    dotInnerNE: {
        top: '-4px',
        right: '-4px'
    },
    dotInnerSE: {
        bottom: '-4px',
        right: '-4px'
    },
    dotInnerNW: {
        top: '-4px',
        left: '-4px'
    },
    dotInnerSW: {
        bottom: '-4px',
        left: '-4px'
    },
    dotInnerCenterVertical: {
        position: 'absolute',
        border: 'none',
        width: '2px',
        height: '8px',
        backgroundColor: '#88f',
        top: '50%',
        left: '50%',
        marginLeft: '-1px',
        marginTop: '-4px'
    },
    dotInnerCenterHorizontal: {
        position: 'absolute',
        border: 'none',
        width: '8px',
        height: '2px',
        backgroundColor: '#88f',
        top: '50%',
        left: '50%',
        marginLeft: '-4px',
        marginTop: '-1px'
    },

    line: {
        position: 'absolute',
        display: 'block',
        zIndex: '100'
    },

    lineS: {
        cursor: 's-resize',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '1px',
        background: 'transparent'
    },
    lineN: {
        cursor: 'n-resize',
        top: '0',
        left: '0',
        width: '100%',
        height: '1px',
        background: 'transparent'
    },
    lineE: {
        cursor: 'e-resize',
        right: '0',
        top: '0',
        width: '1px',
        height: '100%',
        background: 'transparent'
    },
    lineW: {
        cursor: 'w-resize',
        left: '0',
        top: '0',
        width: '1px',
        height: '100%',
        background: 'transparent'
    }

};

module.exports = Cropper;