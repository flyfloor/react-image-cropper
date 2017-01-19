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
        selectionNatural: React.PropTypes.bool,
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
            selectionNatural: false,
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
            selectionNatural = _props.selectionNatural,
            fixedRatio = _props.fixedRatio,
            allowNewSelection = _props.allowNewSelection,
            rate = _props.rate,
            styles = _props.styles,
            imageLoaded = _props.imageLoaded,
            beforeImageLoaded = _props.beforeImageLoaded;

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
            selectionNatural: selectionNatural,
            allowNewSelection: allowNewSelection,
            frameHeight: fixedRatio ? width / rate : height,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
            action: null,
            imgLoaded: false,
            imgBeforeLoaded: false,
            styles: deepExtend({}, defaultStyles, styles),
            imageLoaded: imageLoaded,
            beforeImageLoaded: beforeImageLoaded,
            moved: false,
            originalOriginX: originX,
            originalOriginY: originY,
            originalFrameWidth: width,
            originalFrameHeight: fixedRatio ? width / rate : height
        };
    },
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
                img_height = _state.img_height,
                selectionNatural = _state.selectionNatural;
            var _state2 = _this.state,
                frameWidth = _state2.frameWidth,
                frameHeight = _state2.frameHeight;


            if (selectionNatural) {
                var img = ReactDOM.findDOMNode(_this.refs.img);
                var _rateWidth = img_width / img.naturalWidth;
                var _rateHeight = img_height / img.naturalHeight;
                var realWidth = parseInt(frameWidth * _rateWidth);
                var realHeight = parseInt(frameHeight * _rateHeight);
                var realX = parseInt(originX * _rateHeight);
                var realY = parseInt(originY * _rateWidth);

                frameWidth = realWidth;
                frameHeight = realHeight;
                originX = realX;
                originY = realY;

                _this.setState({ frameWidth: frameWidth, frameHeight: frameHeight, originX: originX, originY: originY });
            }

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
    updateFrame: function updateFrame(newWidth, newHeight, newOriginX, newOriginY) {
        var _this2 = this;

        this.setState({
            frameWidth: newWidth,
            frameHeight: newHeight,
            originX: newOriginX,
            originY: newOriginY,
            originalFrameWidth: newWidth,
            originalFrameHeight: newHeight,
            originalOriginX: newOriginX,
            originalOriginY: newOriginY
        }, function () {
            _this2.initStyles();
        });
    },
    calcPosition: function calcPosition(width, height, left, top, move) {
        var _state3 = this.state,
            img_width = _state3.img_width,
            img_height = _state3.img_height,
            fixedRatio = _state3.fixedRatio;
        var rate = this.props.rate;


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
    imgOnLoad: function imgOnLoad() {
        var imageLoaded = this.state.imageLoaded;

        this.setState({ imgLoaded: true });
        imageLoaded();
    },
    imgGetSizeBeforeLoad: function imgGetSizeBeforeLoad() {
        var that = this;
        setTimeout(function () {
            var img = ReactDOM.findDOMNode(that.refs.img);
            if (img && img.naturalWidth) {
                var beforeImageLoaded = that.state.beforeImageLoaded;


                var heightRatio = img.offsetWidth / img.naturalWidth;
                var height = parseInt(img.naturalHeight * heightRatio);

                that.setState({
                    img_height: height,
                    imgBeforeLoaded: true
                }, function () {
                    return that.initStyles();
                });

                beforeImageLoaded();
            } else if (img) {
                that.imgGetSizeBeforeLoad();
            }
        }, 0);
    },
    createNewFrame: function createNewFrame(e) {
        if (this.state.dragging) {
            var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
            var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
            var rate = this.props.rate;
            var _state4 = this.state,
                frameWidth = _state4.frameWidth,
                frameHeight = _state4.frameHeight,
                startX = _state4.startX,
                startY = _state4.startY,
                offsetLeft = _state4.offsetLeft,
                offsetTop = _state4.offsetTop,
                fixedRatio = _state4.fixedRatio;


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
        var _state5 = this.state,
            originX = _state5.originX,
            originY = _state5.originY,
            startX = _state5.startX,
            startY = _state5.startY,
            frameWidth = _state5.frameWidth,
            frameHeight = _state5.frameHeight,
            maxLeft = _state5.maxLeft,
            maxTop = _state5.maxTop;

        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        var _x = pageX - startX + originX;
        var _y = pageY - startY + originY;
        if (pageX < 0 || pageY < 0) return false;

        if (pageX - startX > 0 || pageY - startY) {
            this.setState({ moved: true });
        }

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
                var offsetLeft = container.offsetLeft,
                    offsetTop = container.offsetTop;

                _this3.setState({
                    offsetLeft: pageX - offsetLeft,
                    offsetTop: pageY - offsetTop,
                    frameWidth: 2,
                    frameHeight: 2,
                    moved: true
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
    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        var width = this.props.width !== newProps.width;
        var height = this.props.height !== newProps.height;
        var originX = this.props.originX !== newProps.originX;
        var originY = this.props.originY !== newProps.originY;

        if (width || height || originX || originY) {
            this.updateFrame(newProps.width, newProps.height, newProps.originX, newProps.originY);
        }
    },
    frameDotMove: function frameDotMove(dir, e) {
        var pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        var pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        var rate = this.props.rate;
        var _state7 = this.state,
            startX = _state7.startX,
            startY = _state7.startY,
            originX = _state7.originX,
            originY = _state7.originY,
            frameWidth = _state7.frameWidth,
            frameHeight = _state7.frameHeight,
            fixedRatio = _state7.fixedRatio;


        if (pageY !== 0 && pageX !== 0) {
            var _x = pageX - startX;
            var _y = pageY - startY;

            if (pageX - startX > 0 || pageY - startY) {
                this.setState({ moved: true });
            }

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
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _maxWidth = _ref.maxWidth,
            _maxHeight = _ref.maxHeight;

        var _state8 = this.state,
            frameWidth = _state8.frameWidth,
            frameHeight = _state8.frameHeight,
            originX = _state8.originX,
            originY = _state8.originY,
            img_width = _state8.img_width;

        var canvas = document.createElement('canvas');
        var img = ReactDOM.findDOMNode(this.refs.img);
        var _rate = img.naturalWidth / img_width;
        var realWidth = frameWidth * _rate;
        var realHeight = frameHeight * _rate;

        var maxWidth = _maxWidth || realWidth;
        var maxHeight = _maxHeight || realHeight;

        var squeezeRatio = maxWidth / realWidth;
        var flattenRatio = maxHeight / realHeight;
        var scaleRatio = Math.min(squeezeRatio, flattenRatio);

        var finalWidth = scaleRatio * realWidth;
        var finalHeight = scaleRatio * realHeight;

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        canvas.getContext("2d").drawImage(img, originX * _rate, originY * _rate, realWidth, realHeight, 0, 0, finalWidth, finalHeight);
        return canvas.toDataURL();
    },
    values: function values() {
        var _state9 = this.state,
            frameWidth = _state9.frameWidth,
            frameHeight = _state9.frameHeight,
            originX = _state9.originX,
            originY = _state9.originY,
            img_width = _state9.img_width,
            img_height = _state9.img_height,
            selectionNatural = _state9.selectionNatural,
            moved = _state9.moved,
            originalOriginX = _state9.originalOriginX,
            originalOriginY = _state9.originalOriginY,
            originalFrameWidth = _state9.originalFrameWidth,
            originalFrameHeight = _state9.originalFrameHeight;


        var img = ReactDOM.findDOMNode(this.refs.img);
        var _return = null;

        var thisOriginX = moved ? originX : originalOriginX;
        var thisOriginY = moved ? originY : originalOriginY;
        var thisFrameWidth = moved ? frameWidth : originalFrameWidth;
        var thisFrameHeight = moved ? frameHeight : originalFrameHeight;

        if (selectionNatural && moved) {
            var _rateWidth = img.naturalWidth / img_width;
            var _rateHeight = img.naturalHeight / img_height;
            var realWidth = parseInt(thisFrameWidth * _rateWidth);
            var realHeight = parseInt(thisFrameHeight * _rateHeight);
            var realX = parseInt(thisOriginX * _rateHeight);
            var realY = parseInt(thisOriginY * _rateWidth);
            _return = { width: realWidth, height: realHeight, x: realX, y: realY };
        } else {
            _return = { width: thisFrameWidth, height: thisFrameHeight, x: thisOriginX, y: thisOriginY };
        }

        return _return;
    },
    render: function render() {
        var _state10 = this.state,
            dragging = _state10.dragging,
            img_height = _state10.img_height,
            img_width = _state10.img_width,
            imgBeforeLoaded = _state10.imgBeforeLoaded;
        var _props3 = this.props,
            src = _props3.src,
            disabled = _props3.disabled;


        var imageNode = React.createElement(
            'div',
            { style: this.state.styles.source, ref: 'sourceNode' },
            React.createElement('img', {
                crossOrigin: 'anonymous',
                src: src,
                style: deepExtend({}, this.state.styles.img, this.state.styles.source_img),
                ref: 'img',
                onLoad: this.imgOnLoad,
                width: img_width, height: img_height
            })
        );

        var node = null;

        if (disabled) {
            node = React.createElement(
                'div',
                { ref: 'container', style: deepExtend({}, this.state.styles.container, {
                        'position': 'relative',
                        'height': img_height
                    }) },
                imageNode,
                React.createElement('div', { style: deepExtend({}, this.state.styles.modal, this.state.styles.modal_disabled) })
            );
        } else {
            node = React.createElement(
                'div',
                { ref: 'container',
                    onMouseDown: this.handleDragStart, onTouchStart: this.handleDragStart,
                    style: deepExtend({}, this.state.styles.container, {
                        'position': 'relative',
                        'height': img_height
                    }) },
                imageNode,
                imgBeforeLoaded ? React.createElement(
                    'div',
                    null,
                    React.createElement('div', { style: this.state.styles.modal }),
                    React.createElement(
                        'div',
                        { style: deepExtend({}, this.state.styles.frame, dragging ? this.state.styles.dragging_frame : {}, {
                                display: 'block',
                                left: this.state.imgLeft,
                                top: this.state.imgTop,
                                width: this.state.imgWidth,
                                height: this.state.imgHeight
                            }), ref: 'frameNode' },
                        React.createElement(
                            'div',
                            { style: this.state.styles.clone },
                            React.createElement('img', {
                                crossOrigin: 'anonymous',
                                src: src,
                                style: deepExtend({}, this.state.styles.img, {
                                    marginLeft: -this.state.imgLeft,
                                    marginTop: -this.state.imgTop
                                }),
                                ref: 'cloneImg',
                                width: img_width,
                                height: img_height
                            })
                        ),
                        React.createElement('span', { style: this.state.styles.move, 'data-action': 'move' }),
                        React.createElement(
                            'span',
                            { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotCenter),
                                'data-action': 'move' },
                            React.createElement('span', {
                                style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerCenterVertical) }),
                            React.createElement('span', {
                                style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerCenterHorizontal) })
                        ),
                        React.createElement(
                            'span',
                            { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotNE),
                                'data-action': 'ne' },
                            React.createElement('span', {
                                style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerNE) })
                        ),
                        React.createElement(
                            'span',
                            { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotN),
                                'data-action': 'n' },
                            React.createElement('span', {
                                style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerN) })
                        ),
                        React.createElement(
                            'span',
                            { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotNW),
                                'data-action': 'nw' },
                            React.createElement('span', {
                                style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerNW) })
                        ),
                        React.createElement(
                            'span',
                            { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotE),
                                'data-action': 'e' },
                            React.createElement('span', {
                                style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerE) })
                        ),
                        React.createElement(
                            'span',
                            { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotW),
                                'data-action': 'w' },
                            React.createElement('span', {
                                style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerW) })
                        ),
                        React.createElement(
                            'span',
                            { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotSE),
                                'data-action': 'se' },
                            React.createElement('span', {
                                style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerSE) })
                        ),
                        React.createElement(
                            'span',
                            { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotS),
                                'data-action': 's' },
                            React.createElement('span', {
                                style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerS) })
                        ),
                        React.createElement(
                            'span',
                            { style: deepExtend({}, this.state.styles.dot, this.state.styles.dotSW),
                                'data-action': 'sw' },
                            React.createElement('span', {
                                style: deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerSW) })
                        ),
                        React.createElement('span', { style: deepExtend({}, this.state.styles.line, this.state.styles.lineN),
                            'data-action': 'n' }),
                        React.createElement('span', { style: deepExtend({}, this.state.styles.line, this.state.styles.lineS),
                            'data-action': 's' }),
                        React.createElement('span', { style: deepExtend({}, this.state.styles.line, this.state.styles.lineW),
                            'data-action': 'w' }),
                        React.createElement('span', { style: deepExtend({}, this.state.styles.line, this.state.styles.lineE),
                            'data-action': 'e' })
                    )
                ) : null
            );
        }

        return node;
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