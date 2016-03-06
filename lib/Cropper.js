'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var Cropper = React.createClass({
    displayName: 'Cropper',
    getDefaultProps: function getDefaultProps() {
        return {
            width: 200,
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
        var rate = _props.rate;

        return {
            img_width: '100%',
            img_height: 'auto',
            originX: originX,
            originY: originY,
            startX: 0,
            startY: 0,
            frameWidth: width,
            frameHeight: width / rate,
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
            var _state = _this.state;
            var img_width = _state.img_width;
            var img_height = _state.img_height;
            var frameWidth = _state.frameWidth;
            var frameHeight = _state.frameHeight;

            var maxLeft = img_width - frameWidth;
            var maxTop = img_height - frameHeight;

            if (originX + frameWidth >= img_width) {
                originX = img_width - frameWidth;
                _this.setState({
                    originX: originX
                });
            }
            if (originY + frameHeight >= img_height) {
                originY = img_height - frameHeight;
                _this.setState({
                    originY: originY
                });
            }

            _this.setState({
                maxLeft: maxLeft,
                maxTop: maxTop,
                imgLoaded: true
            });
            // calc clone position
            _this.calcPosition(frameWidth, frameHeight, originX, originY);
        });
    },
    calcPosition: function calcPosition(width, height, left, top) {
        var frameNode = ReactDOM.findDOMNode(this.refs.frameNode);
        var cloneImg = ReactDOM.findDOMNode(this.refs.cloneImg);
        var _state2 = this.state;
        var img_width = _state2.img_width;
        var img_height = _state2.img_height;


        if (left < 0) left = 0;
        if (top < 0) top = 0;
        if (width + left > img_width) width = img_width;
        if (height + top > img_height || width < 0 || height < 0) return false;

        if (this.props.onCrop) this.props.onCrop(this.props.src, { left: left, top: top, width: width, height: height });

        frameNode.setAttribute('style', 'display:block;left:' + left + 'px;top:' + top + 'px;width:' + width + 'px;height:' + height + 'px');
        cloneImg.setAttribute('style', 'margin-left:' + -left + 'px;margin-top:' + -top + 'px');
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
            var pageX = e.pageX;
            var pageY = e.pageY;
            var rate = this.props.rate;
            var _state3 = this.state;
            var frameWidth = _state3.frameWidth;
            var startX = _state3.startX;
            var startY = _state3.startY;
            var offsetLeft = _state3.offsetLeft;
            var offsetTop = _state3.offsetTop;


            var _x = pageX - startX;
            var _y = pageY - startY;
            var _width = void 0,
                _height = void 0,
                _left = void 0,
                _top = void 0;
            if (_x > 0) {
                if (_y < 0) return this.calcPosition(frameWidth + _x, (frameWidth + _x) / rate, offsetLeft, offsetTop - _x / rate);
                return this.calcPosition(frameWidth + _x, (frameWidth + _x) / rate, offsetLeft, offsetTop);
            }
            if (_y > 0) return this.calcPosition(frameWidth - _x, (frameWidth - _x) / rate, offsetLeft + _x, offsetTop);
            return this.calcPosition(frameWidth - _x, (frameWidth - _x) / rate, offsetLeft + _x, offsetTop + _x / rate);
        }
    },
    handleDrag: function handleDrag(e) {
        if (this.state.dragging) {
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

        var _x = e.pageX - startX + originX;
        var _y = e.pageY - startY + originY;
        if (e.pageX < 0 || e.pageY < 0) return false;
        if (_x > maxLeft) _x = maxLeft;
        if (_y > maxTop) _y = maxTop;
        this.calcPosition(frameWidth, frameHeight, _x, _y);
    },
    handleDragStart: function handleDragStart(e) {
        var _this3 = this;

        var action = e.target.getAttribute('data-action');
        var pageX = e.pageX;
        var pageY = e.pageY;

        this.setState({
            startX: pageX,
            startY: pageY,
            dragging: true,
            action: action
        });
        if (!action) {
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
    },
    componentWillUnmount: function componentWillUnmount() {
        document.removeEventListener('mousemove');
        document.removeEventListener('mousedown');
        document.removeEventListener('mouseup');
        document.removeEventListener('mouseleave');
    },
    frameDotMove: function frameDotMove(dir, e) {
        var pageX = e.pageX;
        var pageY = e.pageY;
        var rate = this.props.rate;
        var _state6 = this.state;
        var startX = _state6.startX;
        var startY = _state6.startY;
        var originX = _state6.originX;
        var originY = _state6.originY;
        var frameWidth = _state6.frameWidth;
        var frameHeight = _state6.frameHeight;


        if (pageY !== 0 && pageX !== 0) {
            var _x = pageX - startX;
            var _y = pageY - startY;
            var new_width = frameWidth + _x;
            switch (dir) {
                case 'ne':
                    return this.calcPosition(new_width, new_width / rate, originX, originY - _x / rate);
                case 'e':
                    return this.calcPosition(new_width, new_width / rate, originX, originY - _x / rate * .5);
                case 'se':
                    return this.calcPosition(new_width, new_width / rate, originX, originY);
                case 'n':
                    var new_height = frameHeight - _y;
                    return this.calcPosition(new_height * rate, new_height, originX + _y * rate * .5, originY + _y);
                case 'nw':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, new_width / rate, originX + _x, originY + _x / rate);
                case 'w':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, new_width / rate, originX + _x, originY + _x / rate * .5);
                case 'sw':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, new_width / rate, originX + _x, originY);
                case 's':
                    new_height = frameHeight + _y;
                    return this.calcPosition(new_height * rate, new_height, originX - _y * rate * .5, originY);
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

        var canvas = document.createElement('canvas');
        var img = ReactDOM.findDOMNode(this.refs.img);
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        canvas.getContext("2d").drawImage(img, originX, originY, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
        return canvas.toDataURL();
    },
    render: function render() {
        var className = '_cropper';
        if (this.state.imgLoaded) className += ' _loaded';
        if (this.state.dragging) className = className + ' _dragging';
        return React.createElement(
            'div',
            { className: className, onMouseLeave: this.handleDragStop,
                ref: 'container', onMouseMove: this.handleDrag,
                onMouseDown: this.handleDragStart, onMouseUp: this.handleDragStop,
                style: { 'position': 'relative', 'height': this.state.img_height } },
            React.createElement(
                'div',
                { className: '_source', ref: 'sourceNode' },
                React.createElement('img', { src: this.props.src, crossOrigin: true, ref: 'img', onLoad: this.imgOnload, width: this.state.img_width, height: this.state.img_height })
            ),
            React.createElement('div', { className: '_modal' }),
            React.createElement(
                'div',
                { className: '_frame', ref: 'frameNode' },
                React.createElement(
                    'div',
                    { className: '_clone' },
                    React.createElement('img', { src: this.props.src, crossOrigin: true, ref: 'cloneImg', width: this.state.img_width })
                ),
                React.createElement('span', { className: '_move', 'data-action': 'move' }),
                React.createElement('span', { className: '_dot _dot-center', 'data-action': 'ne' }),
                React.createElement('span', { className: '_dot _dot-ne', 'data-action': 'ne' }),
                React.createElement('span', { className: '_dot _dot-n', 'data-action': 'n' }),
                React.createElement('span', { className: '_dot _dot-nw', 'data-action': 'nw' }),
                React.createElement('span', { className: '_dot _dot-e', 'data-action': 'e' }),
                React.createElement('span', { className: '_dot _dot-w', 'data-action': 'w' }),
                React.createElement('span', { className: '_dot _dot-se', 'data-action': 'se' }),
                React.createElement('span', { className: '_dot _dot-s', 'data-action': 's' }),
                React.createElement('span', { className: '_dot _dot-sw', 'data-action': 'sw' })
            )
        );
    }
});

Cropper.propTypes = {
    src: React.PropTypes.string.isRequired,
    originX: React.PropTypes.number,
    originY: React.PropTypes.number,
    rate: React.PropTypes.number,
    width: React.PropTypes.number
};

module.exports = Cropper;