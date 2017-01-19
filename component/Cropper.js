const React = require('react');
const ReactDOM = require('react-dom');
const deepExtend = require('deep-extend');

const Cropper = React.createClass({
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
    getDefaultProps() {
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
            imageLoaded: function () {
            },
            beforeImageLoaded: function () {
            }
        };
    },
    getInitialState() {
        let {originX, originY, width, height, selectionNatural, fixedRatio, allowNewSelection, rate, styles, imageLoaded, beforeImageLoaded} = this.props;
        return {
            img_width: '100%',
            img_height: 'auto',
            imgWidth: 200,
            imgheight: 200,
            imgTop: 0,
            imgLeft: 0,
            originX,
            originY,
            startX: 0,
            startY: 0,
            frameWidth: width,
            fixedRatio,
            selectionNatural,
            allowNewSelection,
            frameHeight: fixedRatio ? (width / rate) : height,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
            action: null,
            imgLoaded: false,
            imgBeforeLoaded: false,
            styles: deepExtend({}, defaultStyles, styles),
            imageLoaded,
            beforeImageLoaded,
            moved: false,
            originalOriginX: originX,
            originalOriginY: originY,
            originalFrameWidth: width,
            originalFrameHeight: fixedRatio ? width / rate : height,
        };
    },

    initStyles(){
        const container = ReactDOM.findDOMNode(this.refs.container)
        this.setState({
            img_width: container.offsetWidth
        }, () => {
            // calc frame width height
            let {originX, originY, disabled} = this.props;
            if (disabled) return;
            const {img_width, img_height, selectionNatural} = this.state;
            let {frameWidth, frameHeight} = this.state;


            if (selectionNatural) {
                let img = ReactDOM.findDOMNode(this.refs.img);
                const _rateWidth = img_width / img.naturalWidth;
                const _rateHeight = img_height / img.naturalHeight;
                const realWidth = parseInt(frameWidth * _rateWidth);
                const realHeight = parseInt(frameHeight * _rateHeight);
                const realX = parseInt(originX * _rateHeight);
                const realY = parseInt(originY * _rateWidth);

                frameWidth = realWidth;
                frameHeight = realHeight;
                originX = realX;
                originY = realY;

                this.setState({frameWidth: frameWidth, frameHeight: frameHeight, originX: originX, originY: originY});
            }


            const maxLeft = img_width - frameWidth;
            const maxTop = img_height - frameHeight;

            if (originX + frameWidth >= img_width) {
                originX = img_width - frameWidth;
                this.setState({originX});
            }
            if (originY + frameHeight >= img_height) {
                originY = img_height - frameHeight;
                this.setState({originY});
            }

            this.setState({maxLeft, maxTop});
            // calc clone position
            this.calcPosition(frameWidth, frameHeight, originX, originY);

        });
    },

    updateFrame(newWidth, newHeight, newOriginX, newOriginY)
    {
        this.setState({
            frameWidth: newWidth,
            frameHeight: newHeight,
            originX: newOriginX,
            originY: newOriginY,
            originalFrameWidth: newWidth,
            originalFrameHeight: newHeight,
            originalOriginX: newOriginX,
            originalOriginY: newOriginY
        }, () => {
            this.initStyles();
        });
    },

    calcPosition(width, height, left, top, move){
        const {img_width, img_height, fixedRatio} = this.state;
        const {rate} = this.props;

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
            }
            else {
                width = width - ((width + left) - img_width);
            }
        }

        if (height + top > img_height) {
            if (fixedRatio) {
                top = img_height - height;
            }
            else {
                height = height - ((height + top) - img_height);
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

        this.setState({imgLeft: left, imgTop: top, imgWidth: width, imgHeight: height});
    },

    imgOnLoad(){
        const {imageLoaded} = this.state;
        this.setState({imgLoaded: true});
        imageLoaded();
    },

    imgGetSizeBeforeLoad(){
        var that = this;
        setTimeout(function () {
            let img = ReactDOM.findDOMNode(that.refs.img);
            if (img && img.naturalWidth) {
                const {beforeImageLoaded} = that.state;

                var heightRatio = img.offsetWidth / img.naturalWidth;
                var height = parseInt(img.naturalHeight * heightRatio);

                that.setState({
                    img_height: height,
                    imgBeforeLoaded: true,
                }, () => that.initStyles());

                beforeImageLoaded();

            }
            else if (img) {
                that.imgGetSizeBeforeLoad();
            }

        }, 0)
    },

    createNewFrame(e){
        if (this.state.dragging) {
            const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
            const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
            const {rate} = this.props;
            const {frameWidth, frameHeight, startX, startY, offsetLeft, offsetTop, fixedRatio} = this.state;

            const _x = pageX - startX;
            const _y = pageY - startY;

            if (_x > 0) {
                if (_y < 0) {
                    return this.calcPosition(frameWidth + _x, fixedRatio ? ((frameWidth + _x) / rate) : (frameHeight - _y), offsetLeft, fixedRatio ? (offsetTop - _x / rate) : (offsetTop + _y));
                }
                return this.calcPosition(frameWidth + _x, fixedRatio ? ((frameWidth + _x) / rate) : (frameHeight + _y), offsetLeft, offsetTop);
            }
            if (_y > 0) {
                return this.calcPosition(frameWidth - _x, fixedRatio ? ((frameWidth - _x) / rate) : (frameHeight + _y), offsetLeft + _x, offsetTop);
            }

            return this.calcPosition(frameWidth - _x, fixedRatio ? ((frameWidth - _x) / rate) : (frameHeight - _y), offsetLeft + _x, fixedRatio ? (offsetTop + _x / rate) : (offsetTop + _y));
        }
    },

    handleDrag(e){
        if (this.state.dragging) {
            e.preventDefault();
            let {action} = this.state;
            if (!action) return this.createNewFrame(e)
            if (action == 'move') return this.frameMove(e)
            this.frameDotMove(action, e)
        }
    },

    frameMove(e){
        const {originX, originY, startX, startY, frameWidth, frameHeight, maxLeft, maxTop} = this.state;
        const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        let _x = pageX - startX + originX;
        let _y = pageY - startY + originY;
        if (pageX < 0 || pageY < 0) return false;

        if ((pageX - startX) > 0 || (pageY - startY)) {
            this.setState({moved: true});
        }

        if (_x > maxLeft) _x = maxLeft;
        if (_y > maxTop) _y = maxTop;
        this.calcPosition(frameWidth, frameHeight, _x, _y, true);
    },

    handleDragStart(e){
        const {allowNewSelection} = this.state;
        const action = e.target.getAttribute('data-action') ? e.target.getAttribute('data-action') : e.target.parentNode.getAttribute('data-action');
        const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        if (action || allowNewSelection) {
            e.preventDefault();
            this.setState({
                startX: pageX,
                startY: pageY,
                dragging: true,
                action
            });
        }
        if (!action && allowNewSelection) {
            let container = ReactDOM.findDOMNode(this.refs.container);
            const {offsetLeft, offsetTop} = container;
            this.setState({
                offsetLeft: pageX - offsetLeft,
                offsetTop: pageY - offsetTop,
                frameWidth: 2,
                frameHeight: 2,
                moved: true
            }, () => {
                this.calcPosition(2, 2, pageX - offsetLeft, pageY - offsetTop);
            });
        }
    },

    handleDragStop(e){
        if (this.state.dragging) {
            e.preventDefault();
            const frameNode = ReactDOM.findDOMNode(this.refs.frameNode)
            const {offsetLeft, offsetTop, offsetWidth, offsetHeight} = frameNode;
            const {img_width, img_height} = this.state;
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

    componentDidMount(){
        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('touchmove', this.handleDrag);

        document.addEventListener('mouseup', this.handleDragStop);
        document.addEventListener('touchend', this.handleDragStop);

        this.imgGetSizeBeforeLoad();
    },

    componentWillUnmount(){
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('touchmove', this.handleDrag);

        document.removeEventListener('mouseup', this.handleDragStop);
        document.removeEventListener('touchend', this.handleDragStop);
    },

    componentWillReceiveProps(newProps)
    {
        var width = this.props.width !== newProps.width;
        var height = this.props.height !== newProps.height;
        var originX = this.props.originX !== newProps.originX;
        var originY = this.props.originY !== newProps.originY;

        if (width || height || originX || originY) {
            this.updateFrame(newProps.width, newProps.height, newProps.originX, newProps.originY);
        }
    },

    frameDotMove(dir, e){
        const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        const {rate} = this.props;
        const {startX, startY, originX, originY, frameWidth, frameHeight, fixedRatio} = this.state;

        if (pageY !== 0 && pageX !== 0) {
            const _x = pageX - startX;
            const _y = pageY - startY;

            if ((pageX - startX) > 0 || (pageY - startY)) {
                this.setState({moved: true});
            }

            let new_width = frameWidth + _x;
            let new_height = fixedRatio ? new_width : (frameHeight + _y);
            switch (dir) {
                case 'ne':
                    new_height = frameHeight - _y;
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : new_height, originX, fixedRatio ? (originY - _x / rate) : (originY + _y));
                case 'e':
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : frameHeight, originX, fixedRatio ? (originY - _x / rate * 0.5) : originY);
                case 'se':
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : new_height, originX, originY);
                case 'n':
                    new_height = frameHeight - _y;
                    return this.calcPosition(fixedRatio ? (new_height * rate) : frameWidth, new_height, fixedRatio ? (originX + _y * rate * 0.5) : originX, originY + _y);
                case 'nw':
                    new_width = frameWidth - _x;
                    new_height = frameHeight - _y;
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : new_height, originX + _x, fixedRatio ? (originY + _x / rate) : (originY + _y));
                case 'w':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : frameHeight, originX + _x, fixedRatio ? (originY + _x / rate * 0.5) : originY);
                case 'sw':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, fixedRatio ? (new_width / rate) : new_height, originX + _x, originY);
                case 's':
                    new_height = frameHeight + _y;
                    return this.calcPosition(fixedRatio ? (new_height * rate) : frameWidth, new_height, fixedRatio ? (originX - _y * rate * 0.5) : originX, originY);
                default:
                    return
            }
        }
    },

    crop({
      maxWidth: _maxWidth,
      maxHeight: _maxHeight
    } = {}){
        const {frameWidth, frameHeight, originX, originY, img_width} = this.state;
        let canvas = document.createElement('canvas');
        let img = ReactDOM.findDOMNode(this.refs.img);
        const _rate = img.naturalWidth / img_width;
        const realWidth = frameWidth * _rate;
        const realHeight = frameHeight * _rate;

        const maxWidth = _maxWidth || realWidth;
        const maxHeight = _maxHeight || realHeight;

        const squeezeRatio = maxWidth / realWidth;
        const flattenRatio = maxHeight / realHeight;
        const scaleRatio = Math.min(squeezeRatio, flattenRatio);

        const finalWidth = scaleRatio * realWidth;
        const finalHeight = scaleRatio * realHeight;

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        canvas.getContext("2d").drawImage(img, originX * _rate, originY * _rate, realWidth, realHeight, 0, 0, finalWidth, finalHeight);
        return canvas.toDataURL();
    },

    values(){
        const {frameWidth, frameHeight, originX, originY, img_width, img_height, selectionNatural, moved, originalOriginX, originalOriginY, originalFrameWidth, originalFrameHeight} = this.state;

        let img = ReactDOM.findDOMNode(this.refs.img);
        let _return = null;

        var thisOriginX = moved ? originX : originalOriginX;
        var thisOriginY = moved ? originY : originalOriginY;
        var thisFrameWidth = moved ? frameWidth : originalFrameWidth;
        var thisFrameHeight = moved ? frameHeight : originalFrameHeight;

        if (selectionNatural && moved) {
            const _rateWidth = img.naturalWidth / img_width;
            const _rateHeight = img.naturalHeight / img_height;
            const realWidth = parseInt(thisFrameWidth * _rateWidth);
            const realHeight = parseInt(thisFrameHeight * _rateHeight);
            const realX = parseInt(thisOriginX * _rateHeight);
            const realY = parseInt(thisOriginY * _rateWidth);
            _return = {width: realWidth, height: realHeight, x: realX, y: realY};
        }
        else {
            _return = {width: thisFrameWidth, height: thisFrameHeight, x: thisOriginX, y: thisOriginY};
        }

        return _return;

    },

    render() {
        const {dragging, img_height, img_width, imgBeforeLoaded} = this.state;
        const {src, disabled} = this.props;

        const imageNode = <div style={this.state.styles.source} ref="sourceNode">
            <img
                crossOrigin="anonymous"
                src={src}
                style={deepExtend({}, this.state.styles.img, this.state.styles.source_img)}
                ref='img'
                onLoad={this.imgOnLoad}
                width={img_width} height={img_height}
            />
        </div>;

        let node = null;

        if (disabled) {
            node = <div ref='container' style={deepExtend({}, this.state.styles.container, {
                'position': 'relative',
                'height': img_height
            })}>
                {imageNode}
                <div style={deepExtend({}, this.state.styles.modal, this.state.styles.modal_disabled)}></div>
            </div>;
        }
        else {
            node = <div ref="container"
                        onMouseDown={this.handleDragStart} onTouchStart={this.handleDragStart}
                        style={deepExtend({}, this.state.styles.container, {
                            'position': 'relative',
                            'height': img_height
                        })}>
                {imageNode}
                {imgBeforeLoaded ?
                    <div>
                        <div style={this.state.styles.modal}></div>
                        <div style={
                            deepExtend(
                                {},
                                this.state.styles.frame,
                                dragging ? this.state.styles.dragging_frame : {},
                                {
                                    display: 'block',
                                    left: this.state.imgLeft,
                                    top: this.state.imgTop,
                                    width: this.state.imgWidth,
                                    height: this.state.imgHeight
                                }
                            )} ref="frameNode">
                            <div style={this.state.styles.clone}>
                                <img
                                    crossOrigin="anonymous"
                                    src={src}
                                    style={deepExtend(
                                        {},
                                        this.state.styles.img,
                                        {
                                            marginLeft: -this.state.imgLeft,
                                            marginTop: -this.state.imgTop
                                        }
                                    )}
                                    ref="cloneImg"
                                    width={img_width}
                                    height={img_height}
                                />
                            </div>
                            <span style={this.state.styles.move} data-action='move'></span>
                            <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotCenter)}
                                  data-action='move'>
                               <span
                                   style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerCenterVertical)}></span>
                               <span
                                   style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerCenterHorizontal)}></span>
                           </span>
                            <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotNE)}
                                  data-action="ne">
                               <span
                                   style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerNE)}></span>
                           </span>
                            <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotN)}
                                  data-action="n">
                               <span
                                   style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerN)}></span>
                           </span>
                            <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotNW)}
                                  data-action="nw">
                               <span
                                   style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerNW)}></span>
                           </span>
                            <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotE)}
                                  data-action="e">
                               <span
                                   style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerE)}></span>
                           </span>
                            <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotW)}
                                  data-action="w">
                               <span
                                   style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerW)}></span>
                           </span>
                            <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotSE)}
                                  data-action="se">
                               <span
                                   style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerSE)}></span>
                           </span>
                            <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotS)}
                                  data-action="s">
                               <span
                                   style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerS)}></span>
                           </span>
                            <span style={deepExtend({}, this.state.styles.dot, this.state.styles.dotSW)}
                                  data-action="sw">
                               <span
                                   style={deepExtend({}, this.state.styles.dotInner, this.state.styles.dotInnerSW)}></span>
                           </span>
                            <span style={deepExtend({}, this.state.styles.line, this.state.styles.lineN)}
                                  data-action="n"></span>
                            <span style={deepExtend({}, this.state.styles.line, this.state.styles.lineS)}
                                  data-action="s"></span>
                            <span style={deepExtend({}, this.state.styles.line, this.state.styles.lineW)}
                                  data-action="w"></span>
                            <span style={deepExtend({}, this.state.styles.line, this.state.styles.lineE)}
                                  data-action="e"></span>
                        </div>
                    </div>
                    :
                    null
                }
            </div>;
        }


        return (
            node
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
        marginTop: -4,
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
