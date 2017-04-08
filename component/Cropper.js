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
            imageLoaded: function () { },
            beforeImageLoaded: function () { }
        };
    },
    getInitialState() {
        let {originX, originY, width, height, selectionNatural, fixedRatio, rate, styles, imageLoaded} = this.props;
        return {
            img_width: '100%',
            img_height: 'auto',
            cropWidth: 200,
            cropHeight: 200,
            imgTop: 0,
            imgLeft: 0,
            originX,
            originY,
            startX: 0,
            startY: 0,
            frameWidth: width,
            fixedRatio,
            selectionNatural,
            frameHeight: fixedRatio ? (width / rate) : height,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
            action: null,
            imgBeforeLoaded: false,
            styles: deepExtend({}, defaultStyles, styles),
            moved: false,
        };
    },
    // initialize style, component did mount or component updated.
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

    // props change, update frame
    updateFrame(frameWidth, frameHeight, originX, originY) {
        this.setState({ frameWidth, frameHeight, originX, originY }, () => this.initStyles() );
    },

    // frame width, frame height, position left, position top, if moved
    calcPosition(width, height, left, top, move){
        const {img_width, img_height, fixedRatio} = this.state;
        const {rate} = this.props;
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
                width = width - ((width + left) - img_width);
            }
        }
        
        // frame heigth plust offset top, larger than img's height
        if (height + top > img_height) {
            if (fixedRatio) {
                // if fixed ratio, adjust top with height
                top = img_height - height;
            } else {
                // resize height with top
                height = height - ((height + top) - img_height);
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

        this.setState({imgLeft: left, imgTop: top, cropWidth: width, cropHeight: height});
    },
    
    // image onloaded hook
    imgOnLoad(){
        const {imageLoaded} = this.props;
        imageLoaded();
    },
    
    // adjust image height when image size scaleing change, also initialize styles
    imgGetSizeBeforeLoad(){
        let that = this;
        // trick way to get naturalwidth of image after component did mount
        setTimeout(function () {
            let img = ReactDOM.findDOMNode(that.refs.img);
            if (img && img.naturalWidth) {
                const {beforeImageLoaded} = that.props;
                
                // image scaleing
                let _heightRatio = img.offsetWidth / img.naturalWidth;
                let height = parseInt(img.naturalHeight * _heightRatio);

                that.setState({
                    img_height: height,
                    imgBeforeLoaded: true,
                }, () => that.initStyles());
                // before image loaded hook
                beforeImageLoaded();

            } else if (img) {
                // catch if image naturalwidth is 0
                that.imgGetSizeBeforeLoad();
            }

        }, 0)
    },
    // create a new frame
    createNewFrame(e){
        if (this.state.dragging) {
            // click or touch event
            const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
            const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
            const {rate} = this.props;
            const {frameWidth, frameHeight, startX, startY, offsetLeft, offsetTop, fixedRatio} = this.state;
            
            // offset x and y
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

    // frame move handler
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
    
    // starting draging
    handleDragStart(e){
        const {allowNewSelection} = this.props;
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
    
    // stop draging
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

    componentWillReceiveProps(newProps) {
        const {width, height, originX, originY} = this.props

        if (width !== newProps.width 
            || height !== newProps.height 
            || originX !== newProps.originX 
            || originY !== newProps.originY) {
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

    crop(){
        const {frameWidth, frameHeight, originX, originY, img_width} = this.state;
        let canvas = document.createElement('canvas');
        let img = ReactDOM.findDOMNode(this.refs.img);
        const _rate = img.naturalWidth / img_width;
        const realFrameWidth = frameWidth * _rate;
        const realFrameHeight = frameHeight * _rate;
        const realOriginX = originX * _rate
        const realOriginY = originY * _rate

        canvas.width = frameWidth;
        canvas.height = frameHeight;

        canvas.getContext("2d").drawImage(img, realOriginX, realOriginY, realFrameWidth, realFrameHeight, 0, 0, frameWidth, frameHeight);
        return canvas.toDataURL();
    },

    values(){
        const {frameWidth, frameHeight, originX, originY, img_width, img_height, selectionNatural, moved } = this.state;
        return { width: frameWidth, height: frameHeight, x: originX, y: originY, imgWidth: img_width, imgHeight: img_height };
    },

    render() {
        const {dragging, img_height, img_width, imgBeforeLoaded, styles} = this.state;
        const {src, disabled} = this.props;

        const imageNode = <div style={styles.source} ref="sourceNode">
            <img crossOrigin="anonymous"
                src={src}
                style={deepExtend({}, styles.img, styles.source_img)}
                ref='img'
                onLoad={this.imgOnLoad}
                width={img_width} height={img_height}
            />
        </div>;

        let node = null;

        if (disabled) {
            node = <div ref='container' style={deepExtend({}, styles.container, {
                'position': 'relative',
                'height': img_height
            })}>
                {imageNode}
                <div style={deepExtend({}, styles.modal, styles.modal_disabled)}></div>
            </div>;
        }
        else {
            node = <div ref="container"
                        onMouseDown={this.handleDragStart} onTouchStart={this.handleDragStart}
                        style={deepExtend({}, styles.container, {
                            'position': 'relative',
                            'height': img_height
                        })}>
                {imageNode}
                {imgBeforeLoaded ?
                    <div>
                        <div style={styles.modal}></div>
                        <div style={
                            deepExtend(
                                {},
                                styles.frame,
                                dragging ? styles.dragging_frame : {},
                                {
                                    display: 'block',
                                    left: this.state.imgLeft,
                                    top: this.state.imgTop,
                                    width: this.state.cropWidth,
                                    height: this.state.cropHeight
                                }
                            )} ref="frameNode">
                            <div style={styles.clone}>
                                <img
                                    crossOrigin="anonymous"
                                    src={src}
                                    style={deepExtend(
                                        {},
                                        styles.img,
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
                            <span style={styles.move} data-action='move'></span>
                            <span style={deepExtend({}, styles.dot, styles.dotCenter)}
                                  data-action='move'>
                               <span
                                   style={deepExtend({}, styles.dotInner, styles.dotInnerCenterVertical)}></span>
                               <span
                                   style={deepExtend({}, styles.dotInner, styles.dotInnerCenterHorizontal)}></span>
                           </span>
                            <span style={deepExtend({}, styles.dot, styles.dotNE)}
                                  data-action="ne">
                               <span
                                   style={deepExtend({}, styles.dotInner, styles.dotInnerNE)}></span>
                           </span>
                            <span style={deepExtend({}, styles.dot, styles.dotN)}
                                  data-action="n">
                               <span
                                   style={deepExtend({}, styles.dotInner, styles.dotInnerN)}></span>
                           </span>
                            <span style={deepExtend({}, styles.dot, styles.dotNW)}
                                  data-action="nw">
                               <span
                                   style={deepExtend({}, styles.dotInner, styles.dotInnerNW)}></span>
                           </span>
                            <span style={deepExtend({}, styles.dot, styles.dotE)}
                                  data-action="e">
                               <span
                                   style={deepExtend({}, styles.dotInner, styles.dotInnerE)}></span>
                           </span>
                            <span style={deepExtend({}, styles.dot, styles.dotW)}
                                  data-action="w">
                               <span
                                   style={deepExtend({}, styles.dotInner, styles.dotInnerW)}></span>
                           </span>
                            <span style={deepExtend({}, styles.dot, styles.dotSE)}
                                  data-action="se">
                               <span
                                   style={deepExtend({}, styles.dotInner, styles.dotInnerSE)}></span>
                           </span>
                            <span style={deepExtend({}, styles.dot, styles.dotS)}
                                  data-action="s">
                               <span
                                   style={deepExtend({}, styles.dotInner, styles.dotInnerS)}></span>
                           </span>
                            <span style={deepExtend({}, styles.dot, styles.dotSW)}
                                  data-action="sw">
                               <span
                                   style={deepExtend({}, styles.dotInner, styles.dotInnerSW)}></span>
                           </span>
                            <span style={deepExtend({}, styles.line, styles.lineN)}
                                  data-action="n"></span>
                            <span style={deepExtend({}, styles.line, styles.lineS)}
                                  data-action="s"></span>
                            <span style={deepExtend({}, styles.line, styles.lineW)}
                                  data-action="w"></span>
                            <span style={deepExtend({}, styles.line, styles.lineE)}
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

let defaultStyles = {
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
