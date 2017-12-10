const React = require('react')
const Component = require('react').Component
const ReactDOM = require('react-dom')
const deepExtend = require('deep-extend')
const PropTypes = require('prop-types')

class Cropper extends Component {
    constructor(props) {
        super(props);
        let {originX, originY, width, height, fixedRatio, ratio, styles} = props
        this.state = {
            // background image width
            imgWidth: '100%',
            // background image height
            imgHeight: 'auto',
            // cropper width, drag trigger changing
            frameWidth4Style: width,
            // cropper height, drag trigger changing
            frameHeight4Style: fixedRatio ? (width / ratio) : height,
            // cropper height, drag trigger changing
            toImgTop4Style: 0,
            toImgLeft4Style: 0,
            // cropper original position(x axis), accroding to image left
            originX,
            // cropper original position(y axis), accroding to image top
            originY,
            // dragging start, position's pageX and pageY
            startPageX: 0,
            startPageY: 0,
            // frame width, change only dragging stop 
            frameWidth: width,
            // frame height, change only dragging stop 
            frameHeight: fixedRatio ? (width / ratio) : height,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
            action: null,
            imgLoaded: false,
            styles: deepExtend({}, defaultStyles, styles),
        }
    }
    
    // initialize style, component did mount or component updated.
    initStyles (){
        const container = ReactDOM.findDOMNode(this.container)
        this.setState({
            imgWidth: container.offsetWidth
        }, () => {
            // calc frame width height
            let {originX, originY, disabled} = this.props
            if (disabled) return
            const {imgWidth, imgHeight} = this.state
            let {frameWidth, frameHeight} = this.state

            const maxLeft = imgWidth - frameWidth
            const maxTop = imgHeight - frameHeight

            if (originX + frameWidth >= imgWidth) {
                originX = imgWidth - frameWidth
                this.setState({originX})
            }
            if (originY + frameHeight >= imgHeight) {
                originY = imgHeight - frameHeight
                this.setState({originY})
            }

            this.setState({maxLeft, maxTop})
            // calc clone position
            this.calcPosition(frameWidth, frameHeight, originX, originY, () => {
                const {frameWidth4Style, frameHeight4Style, toImgTop4Style, toImgLeft4Style} = this.state
                this.setState({
                    frameWidth: frameWidth4Style,
                    frameHeight: frameHeight4Style,
                    originX: toImgLeft4Style,
                    originY: toImgTop4Style,
                });
            })

        })
    }

    componentDidMount() {
        // event
        document.addEventListener('mousemove', this.handleDrag.bind(this))
        document.addEventListener('touchmove', this.handleDrag.bind(this))

        document.addEventListener('mouseup', this.handleDragStop.bind(this))
        document.addEventListener('touchend', this.handleDragStop.bind(this))

        this.imgGetSizeBeforeLoad()
    }

    componentWillUnmount() {
        // remove event
        document.removeEventListener('mousemove', this.handleDrag.bind(this))
        document.removeEventListener('touchmove', this.handleDrag.bind(this))

        document.removeEventListener('mouseup', this.handleDragStop.bind(this))
        document.removeEventListener('touchend', this.handleDragStop.bind(this))
    }

    // props change to update frame
    componentWillReceiveProps(newProps) {
        const {width, height, originX, originY} = this.props

        if (width !== newProps.width || height !== newProps.height 
            || originX !== newProps.originX || originY !== newProps.originY) {
            // update frame
            this.setState({ 
                frameWidth: newProps.width, 
                frameHeight: newProps.height, 
                originX: newProps.originX, 
                originY: newProps.originY 
            }, () => this.initStyles() )
        }
    }

    // image onloaded hook
    imgOnLoad() {
        this.props.onImgLoad()
    }

    // adjust image height when image size scaleing change, also initialize styles
    imgGetSizeBeforeLoad() {
        let that = this
        // trick way to get naturalwidth of image after component did mount
        setTimeout(function () {
            let img = ReactDOM.findDOMNode(that.img)
            if (img && img.naturalWidth) {
                const {beforeImgLoad} = that.props
                
                // image scaleing
                let _heightRatio = img.offsetWidth / img.naturalWidth
                let height = parseInt(img.naturalHeight * _heightRatio)
                // resize imgHeight 
                that.setState({
                    imgHeight: height,
                    imgLoaded: true,
                }, () => that.initStyles())
                // before image loaded hook
                beforeImgLoad()

            } else if (img) {
                // catch if image naturalwidth is 0
                that.imgGetSizeBeforeLoad()
            }

        }, 0)
    }

    // frame width, frame height, position left, position top
    calcPosition (width, height, left, top, callback){
        const {imgWidth, imgHeight} = this.state
        const {ratio, fixedRatio} = this.props
        // width < 0 or height < 0, frame invalid
        if (width < 0 || height < 0) return false
        // if ratio is fixed
        if (fixedRatio) {
            // adjust by width
            if (width / imgWidth > height / imgHeight) {
                if (width > imgWidth) {
                    width = imgWidth
                    left = 0
                    height = width / ratio
                }
            } else {
            // adjust by height
                if (height > imgHeight) {
                    height = imgHeight
                    top = 0
                    width = height * ratio
                }
            }
        }
        // frame width plus offset left, larger than img's width
        if (width + left > imgWidth) {
            if (fixedRatio) {
                // if fixed ratio, adjust left with width
                left = imgWidth - width
            } else {
                // resize width with left
                width = width - ((width + left) - imgWidth)
            }
        }
        // frame heigth plust offset top, larger than img's height
        if (height + top > imgHeight) {
            if (fixedRatio) {
                // if fixed ratio, adjust top with height
                top = imgHeight - height
            } else {
                // resize height with top
                height = height - ((height + top) - imgHeight)
            }
        }
        // left is invalid
        if (left < 0) {
            left = 0
        }
        // top is invalid
        if (top < 0) {
            top = 0
        }
        // if frame width larger than img width
        if (width > imgWidth) {
            width = imgWidth
        }
        // if frame height larger than img height
        if (height > imgHeight) {
            height = imgHeight
        }
        this.setState({ 
            toImgLeft4Style: left, 
            toImgTop4Style: top, 
            frameWidth4Style: width, 
            frameHeight4Style: height
        }, () => {
            if (callback) callback(this)
        })
    }

    // create a new frame, and drag, so frame width and height is became larger.
    createNewFrame(e) {
        if (this.state.dragging) {
            // click or touch event
            const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX
            const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY
            const {ratio, fixedRatio} = this.props
            const {frameWidth, frameHeight, startPageX, startPageY, originX, originY} = this.state
            
            // click or touch point's offset from source image top
            const _x = pageX - startPageX
            const _y = pageY - startPageY
            
            // frame new width, height, left, top
            let _width = frameWidth + Math.abs(_x)
            let _height = fixedRatio ? (frameWidth + Math.abs(_x)) / ratio : frameHeight + Math.abs(_y)
            let _left = originX
            let _top = originY
            
            if (_y < 0) {
                // drag and resize to top, top changing
                _top = fixedRatio ? originY - Math.abs(_x) / ratio : originY - Math.abs(_y)
            }

            if (_x < 0) {
                // drag and resize, go to left, left changing
                _left = originX + _x
            }
            // calc position
            return this.calcPosition(_width, _height, _left, _top)
        }
    }

    // frame move handler
    frameMove(e) {
        const {originX, originY, startPageX, startPageY, frameWidth, frameHeight, maxLeft, maxTop} = this.state
        const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX
        const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY
        let _x = pageX - startPageX + originX
        let _y = pageY - startPageY + originY
        if (pageX < 0 || pageY < 0) return false

        if (_x > maxLeft) _x = maxLeft
        if (_y > maxTop) _y = maxTop
        // frame width, frame height not change, top and left changing
        this.calcPosition(frameWidth, frameHeight, _x, _y)
    }

    // drag dot to different direction
    frameDotMove(dir, e){
        const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX
        const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY
        const {ratio, fixedRatio} = this.props
        const {startPageX, startPageY, originX, originY, 
                frameWidth4Style, frameHeight4Style,
                frameWidth, frameHeight, imgWidth, imgHeight} = this.state

        if (pageY !== 0 && pageX !== 0) {
            // current drag position offset x and y to first drag start position
            const _x = pageX - startPageX
            const _y = pageY - startPageY

            let _width = 0
            let _height = 0
            let _top = 0
            let _left = 0
            // just calc width, height, left, top in each direction
            switch (dir) {
                case 'ne':
                    _width = frameWidth + _x
                    _height = fixedRatio ? _width / ratio : frameHeight - _y
                    _left = originX
                    _top = fixedRatio ? (originY - _x / ratio) : originY + _y
                    break
                case 'e':
                    _width = frameWidth + _x
                    _height = fixedRatio ? _width / ratio : frameHeight
                    _left = originX
                    _top = fixedRatio ? originY - _x / ratio * 0.5 : originY
                    break
                case 'se':
                    _width = frameWidth + _x
                    _height = fixedRatio ? _width / ratio : frameHeight + _y
                    _left = originX
                    _top = originY
                    break
                case 'n':
                    _height = frameHeight - _y
                    _width = fixedRatio ?  _height * ratio : frameWidth
                    _left = fixedRatio ? originX + _y * ratio * 0.5 : originX
                    _top = originY + _y
                    break
                case 'nw':
                    _width = frameWidth - _x
                    _height = fixedRatio ? _width / ratio : frameHeight - _y
                    _left = originX + _x
                    _top = fixedRatio ? originY + _x / ratio : originY + _y
                    break
                case 'w':
                    _width = frameWidth - _x
                    _height = fixedRatio ? _width / ratio : frameHeight
                    _left = originX + _x
                    _top = fixedRatio ? originY + _x / ratio * 0.5 : originY
                    break
                case 'sw':
                    _width = frameWidth - _x
                    _height = fixedRatio ? _width / ratio : frameHeight + _y
                    _left = originX + _x
                    _top = originY
                    break
                case 's':
                    _height = frameHeight + _y
                    _width = fixedRatio ? _height * ratio : frameWidth
                    _left = fixedRatio ? originX - _y * ratio * 0.5 : originX
                    _top = originY
                    break
                default:
                    break
            }
            
            if (_width > imgWidth || _height > imgHeight) {
                if (frameWidth4Style >= imgWidth || frameHeight4Style >= imgHeight) {
                    return false
                }
            }

            return this.calcPosition(_width, _height, _left, _top)
        }
    }

    // judge whether to create new frame, frame or frame dot move acroding to action
    handleDrag(e) {
        if (this.state.dragging) {
            e.preventDefault()
            let {action} = this.state
            if (!action) return this.createNewFrame(e)
            if (action == 'move') return this.frameMove(e)
            this.frameDotMove(action, e)
        }
    }

    // starting dragging
    handleDragStart(e) {
        const {allowNewSelection} = this.props
        const action = e.target.getAttribute('data-action')
                        ? e.target.getAttribute('data-action') 
                        : e.target.parentNode.getAttribute('data-action')

        const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX
        const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY

        // if drag or move or allow new selection, change startPageX, startPageY, dragging state
        if (action || allowNewSelection) {
            e.preventDefault()
            // drag start, set startPageX, startPageY for dragging start point
            this.setState({
                startPageX: pageX,
                startPageY: pageY,
                dragging: true,
                action
            })
        }
        // if no action and allowNewSelection, then create a new frame
        if (!action && allowNewSelection) {
            let container = ReactDOM.findDOMNode(this.container)
            const {offsetLeft, offsetTop} = container

            this.setState({
                // set offset left and top of new frame 
                originX: pageX - offsetLeft,
                originY: pageY - offsetTop,
                frameWidth: 2,
                frameHeight: 2,
            }, () => this.calcPosition(2, 2, pageX - offsetLeft, pageY - offsetTop) )
        }
    }

    // crop image
    crop(){
        const {frameWidth, frameHeight, originX, originY, imgWidth} = this.state
        let canvas = document.createElement('canvas')
        let img = ReactDOM.findDOMNode(this.img)
        // crop accroding image's natural width
        const _scale = img.naturalWidth / imgWidth
        const realFrameWidth = frameWidth * _scale
        const realFrameHeight = frameHeight * _scale
        const realOriginX = originX * _scale
        const realOriginY = originY * _scale

        canvas.width = frameWidth
        canvas.height = frameHeight

        canvas.getContext("2d").drawImage(img, realOriginX, realOriginY, realFrameWidth, realFrameHeight, 0, 0, frameWidth, frameHeight)
        return canvas.toDataURL()
    }

    // get current values
    values(){
        const {frameWidth, frameHeight, originX, originY, imgWidth, imgHeight } = this.state
        return { width: frameWidth, height: frameHeight, x: originX, y: originY, imgWidth, imgHeight }
    }

    // stop dragging
    handleDragStop(e) {
        if (this.state.dragging) {
            e.preventDefault()
            const frameNode = ReactDOM.findDOMNode(this.frameNode)
            const {offsetLeft, offsetTop, offsetWidth, offsetHeight} = frameNode
            const {imgWidth, imgHeight} = this.state
            this.setState({
                originX: offsetLeft,
                originY: offsetTop,
                dragging: false,
                frameWidth: offsetWidth,
                frameHeight: offsetHeight,
                maxLeft: imgWidth - offsetWidth,
                maxTop: imgHeight - offsetHeight,
                action: null
            }, () => {
                let {onChange} = this.props
                if (onChange) onChange(this.values())
            })
        }
    }

    render() {
        const {dragging, imgHeight, imgWidth, imgLoaded, styles} = this.state
        const {src, disabled} = this.props

        const imageNode = (
            <div style={styles.source} ref={ref => this.sourceNode = ref}>
                <img crossOrigin="anonymous"
                    src={src} ref={ref => this.img = ref}
                    style={ deepExtend({}, styles.img, styles.source_img) }
                    onLoad={this.imgOnLoad.bind(this)}
                    width={imgWidth} height={imgHeight} />
            </div>
        )
        // disabled cropper
        if (disabled) {
            return (
                <div style={ deepExtend({}, 
                            styles.container, 
                            {
                                'position': 'relative',
                                'height': imgHeight
                            })}
                    ref={ref => this.container = ref}>
                    {imageNode}
                    <div style={ deepExtend({}, styles.modal, styles.modal_disabled) }></div>
                </div>
            )
        }

        return (
            <div onMouseDown={this.handleDragStart.bind(this)} onTouchStart={this.handleDragStart.bind(this)}
                style={ deepExtend({}, 
                        styles.container, 
                        {
                            'position': 'relative',
                            'height': imgHeight
                        }) } 
                ref={ref => this.container = ref}>

                {imageNode}
                {imgLoaded ?
                    <div>
                        <div style={styles.modal}></div>
                        {/*frame container*/}
                        <div style={ deepExtend({}, 
                                    styles.frame, 
                                    dragging ? styles.dragging_frame : {}, 
                                    { 
                                        display: 'block', 
                                        left: this.state.toImgLeft4Style, 
                                        top: this.state.toImgTop4Style, 
                                        width: this.state.frameWidth4Style, 
                                        height: this.state.frameHeight4Style 
                                    }) } 
                            ref={ref => this.frameNode = ref}>

                            {/*clone img*/}
                            <div style={styles.clone}>
                                <img src={src} crossOrigin="anonymous"
                                    width={imgWidth} height={imgHeight} 
                                    style={ deepExtend({}, 
                                            styles.img, 
                                            { 
                                                marginLeft: -this.state.toImgLeft4Style, 
                                                marginTop: -this.state.toImgTop4Style 
                                            }) }
                                    ref={ref => this.cloneImg = ref} />
                            </div>

                            {/*move element*/}
                            <span style={ styles.move } data-action='move'></span> 
                            {/*move center element*/}
                            <span style={ deepExtend({}, styles.dot, styles.dotCenter) } data-action='move'>
                                <span style={ deepExtend({}, styles.dotInner, styles.dotInnerCenterVertical) }></span>
                                <span style={ deepExtend({}, styles.dotInner, styles.dotInnerCenterHorizontal) }></span>
                            </span>

                            {/*frame dot elements*/}
                            <span style={ deepExtend({}, styles.dot, styles.dotNE) } data-action="ne">
                                <span style={ deepExtend({}, styles.dotInner, styles.dotInnerNE) }></span>
                            </span>
                            <span style={ deepExtend({}, styles.dot, styles.dotN)} data-action="n">
                               <span style={ deepExtend({}, styles.dotInner, styles.dotInnerN) }></span>
                            </span>
                            <span style={ deepExtend({}, styles.dot, styles.dotNW) } data-action="nw">
                               <span style={ deepExtend({}, styles.dotInner, styles.dotInnerNW) }></span>
                            </span>
                            <span style={ deepExtend({}, styles.dot, styles.dotE) } data-action="e">
                               <span style={ deepExtend({}, styles.dotInner, styles.dotInnerE) }></span>
                            </span>
                            <span style={ deepExtend({}, styles.dot, styles.dotW) } data-action="w">
                               <span style={ deepExtend({}, styles.dotInner, styles.dotInnerW) }></span>
                            </span>
                            <span style={ deepExtend({}, styles.dot, styles.dotSE) } data-action="se">
                               <span style={ deepExtend({}, styles.dotInner, styles.dotInnerSE) }></span>
                            </span>
                            <span style={ deepExtend({}, styles.dot, styles.dotS) } data-action="s">
                               <span style={ deepExtend({}, styles.dotInner, styles.dotInnerS) }></span>
                            </span>
                            <span style={ deepExtend({}, styles.dot, styles.dotSW) } data-action="sw">
                               <span style={ deepExtend({}, styles.dotInner, styles.dotInnerSW) }></span>
                            </span>

                            {/*frame line elements*/}
                            <span style={ deepExtend({}, styles.line, styles.lineN) } data-action="n"></span>
                            <span style={ deepExtend({}, styles.line, styles.lineS) } data-action="s"></span>
                            <span style={ deepExtend({}, styles.line, styles.lineW) } data-action="w"></span>
                            <span style={ deepExtend({}, styles.line, styles.lineE) } data-action="e"></span>
                        </div>
                    </div>
                    : null
                }
            </div>
        )
    }
}

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
    onChange: PropTypes.func,
}

Cropper.defaultProps = {
    width: 200,
    height: 200,
    fixedRatio: true,
    allowNewSelection: true,
    ratio: 1,
    originX: 0,
    originY: 0,
    styles: {},
    onImgLoad: function () { },
    beforeImgLoad: function () { }
};

/*
default inline styles
*/
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

}


module.exports = Cropper
