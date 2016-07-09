const React = require('react');
const ReactDOM = require('react-dom');

const Cropper = React.createClass({
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
    },
    getDefaultProps() {
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
    getInitialState() {
        let {originX, originY, width, height, fixedRatio, allowNewSelection, rate} = this.props;
        return {
            img_width: '100%',
            img_height: 'auto',
            originX,
            originY,
            startX: 0,
            startY: 0,
            frameWidth: width,
            fixedRatio: fixedRatio,
            allowNewSelection: allowNewSelection,
            frameHeight: fixedRatio ? (width / rate) : height,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
            action: null,
            imgLoaded: false
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
            const {img_width, img_height, frameWidth, frameHeight} = this.state;
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

            this.setState({maxLeft, maxTop, imgLoaded: true});
            // calc clone position
            this.calcPosition(frameWidth, frameHeight, originX, originY);

        });
    },

    calcPosition(width, height, left, top, move){
        const frameNode = ReactDOM.findDOMNode(this.refs.frameNode);
        const cloneImg = ReactDOM.findDOMNode(this.refs.cloneImg);
        const {img_width, img_height, fixedRatio} = this.state;
        const {src, disabled, rate} = this.props;


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

        frameNode.setAttribute('style', `display:block;left:${left}px;top:${top}px;width:${width}px;height:${height}px`);
        cloneImg.setAttribute('style', `margin-left:${-left}px;margin-top:${-top}px`);
    },

    imgOnload(){
        const img = ReactDOM.findDOMNode(this.refs.img)
        this.setState({
            img_height: img.offsetHeight
        }, () => this.initStyles());
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
        if (_x > maxLeft) _x = maxLeft;
        if (_y > maxTop) _y = maxTop;
        this.calcPosition(frameWidth, frameHeight, _x, _y, true);
    },

    handleDragStart(e){
        const {allowNewSelection} = this.state;
        const action = e.target.getAttribute('data-action');
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
                frameHeight: 2
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
    },

    componentWillUnmount(){
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('touchmove', this.handleDrag);

        document.removeEventListener('mouseup', this.handleDragStop);
        document.removeEventListener('touchend', this.handleDragStop);
    },

    frameDotMove(dir, e){
        const pageX = e.pageX ? e.pageX : e.targetTouches[0].pageX;
        const pageY = e.pageY ? e.pageY : e.targetTouches[0].pageY;
        const {rate} = this.props;
        const {startX, startY, originX, originY, frameWidth, frameHeight, img_width, img_height, fixedRatio} = this.state;

        if (pageY !== 0 && pageX !== 0) {
            const _x = pageX - startX;
            const _y = pageY - startY;
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
        const {src} = this.props;
        let canvas = document.createElement('canvas');
        let img = ReactDOM.findDOMNode(this.refs.img);
        const _rate = img.naturalWidth / img_width;
        const realWidth = frameWidth * _rate;
        const realHeight = frameHeight * _rate;
        canvas.width = realWidth;
        canvas.height = realHeight;

        canvas.getContext("2d").drawImage(img, originX * _rate, originY * _rate, realWidth, realHeight, 0, 0, realWidth, realHeight);
        return canvas.toDataURL();
    },

    values(){
        const {frameWidth, frameHeight, originX, originY, img_width, img_height} = this.state;
        let img = ReactDOM.findDOMNode(this.refs.img);
        const _rateWidth = img.naturalWidth / img_width;
        const _rateHeight = img.naturalHeight / img_height;
        const realWidth = parseInt(frameWidth * _rateWidth);
        const realHeight = parseInt(frameHeight * _rateHeight);
        return {width: realWidth, height: realHeight, x: originX, y: originY};
    },

    render() {
        let className = ['_cropper'];
        const {imgLoaded, dragging, img_height, img_width} = this.state;
        const {src, disabled} = this.props;

        if (imgLoaded) className.push('_loaded');
        if (dragging) className.push('_dragging');
        className = className.join(' ');
        if (disabled) className = '_cropper _disabled';
        const imageNode = <div className="_source" ref="sourceNode">
            <img src={src} crossOrigin ref='img' onLoad={this.imgOnload}
                 width={img_width} height={img_height}/>
        </div>;

        const node = disabled ?
            <div className={className} ref='container' style={{'position': 'relative', 'height': img_height}}>
                 {imageNode}
                     <div className="_modal"></div>
            </div>
            : <div className={className}
                   ref="container"
                   onMouseDown={this.handleDragStart} onTouchStart={this.handleDragStart}
                   style={{'position': 'relative', 'height': img_height}}>
                   {imageNode}
                       <div className="_modal"></div>
                       <div className="_frame" ref="frameNode">
                           <div className="_clone">
                               <img src={src} crossOrigin ref="cloneImg" width={img_width} height={img_height}/>
                           </div>
                           <span className="_move" data-action='move'></span>
                           <span className="_dot _dot-center" data-action='move'></span>
                           <span className="_dot _dot-ne" data-action="ne"></span>
                           <span className="_dot _dot-n" data-action="n"></span>
                           <span className="_dot _dot-nw" data-action="nw"></span>
                           <span className="_dot _dot-e" data-action="e"></span>
                           <span className="_dot _dot-w" data-action="w"></span>
                           <span className="_dot _dot-se" data-action="se"></span>
                           <span className="_dot _dot-s" data-action="s"></span>
                           <span className="_dot _dot-sw" data-action="sw"></span>
                           <span className="_line _line-n" data-action="n"></span>
                           <span className="_line _line-s" data-action="s"></span>
                           <span className="_line _line-w" data-action="w"></span>
                           <span className="_line _line-e" data-action="e"></span>
                       </div>
        </div>;

        return (
            node
        );
    }
});

module.exports = Cropper