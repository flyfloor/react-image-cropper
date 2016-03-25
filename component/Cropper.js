const React = require('react');
const ReactDOM = require('react-dom');

const Cropper = React.createClass({
    PropTypes: {
        src: React.PropTypes.string.isRequired,
        originX: React.PropTypes.number,
        originY: React.PropTypes.number,
        rate: React.PropTypes.number,
        width: React.PropTypes.number,
        disabled: React.PropTypes.bool,
    },
    getDefaultProps() {
        return {
            width: 200,
            rate: 1,
            originX: 0,
            originY: 0,
        };
    },
    getInitialState() {
        let { originX, originY, width, rate } = this.props;
        return {
            img_width: '100%',
            img_height: 'auto',
            originX,
            originY,
            startX:0,
            startY: 0,
            frameWidth: width,
            frameHeight: width / rate,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
            action: null,
            imgLoaded: false,
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
                this.setState({ originX });
            }
            if (originY + frameHeight >= img_height) {
                originY = img_height - frameHeight;
                this.setState({ originY });
            }

            this.setState({ maxLeft, maxTop, imgLoaded: true });
            // calc clone position
            this.calcPosition(frameWidth, frameHeight, originX, originY)

        });
    },

    calcPosition(width, height, left, top){
        const frameNode = ReactDOM.findDOMNode(this.refs.frameNode)
        const cloneImg = ReactDOM.findDOMNode(this.refs.cloneImg)
        const {img_width, img_height} = this.state;
        const {src, disabled, rate} = this.props;
        
        if (width < 0 || height < 0) return false;
        // width / height > img_width /img_height
        if (width / img_width > height / img_height) {
            if (width > img_width) {
                width = img_width;
                left = 0;
                height = width / rate;
            }
        } else {
            if (height > img_height) {
                height = img_height;
                top = 0;
                width = height * rate;
            }
        }
        if (width + left > img_width) left = img_width - width;
        if (height + top > img_height) top = img_height - height;
        if (left < 0) left = 0;
        if (top < 0) top = 0;

        frameNode.setAttribute('style', `display:block;left:${left}px;top:${top}px;width:${width}px;height:${height}px`)
        cloneImg.setAttribute('style', `margin-left:${-left}px;margin-top:${-top}px`)
    },

    imgOnload(){
        const img = ReactDOM.findDOMNode(this.refs.img)
        this.setState({
            img_height: img.offsetHeight
        }, () => this.initStyles());
    },

    createNewFrame(e){
        if (this.state.dragging) {
            const {pageX, pageY} = e;
            const {rate} = this.props;
            const {frameWidth, startX, startY, offsetLeft, offsetTop} = this.state;

            const _x = pageX - startX;
            const _y = pageY - startY;

            if (_x > 0) {
                if(_y < 0) return this.calcPosition(frameWidth + _x, (frameWidth + _x) / rate, offsetLeft, offsetTop - _x / rate)
                return this.calcPosition(frameWidth + _x, (frameWidth + _x) / rate, offsetLeft, offsetTop)
            }
            if (_y > 0) return this.calcPosition(frameWidth - _x, (frameWidth - _x) / rate,  offsetLeft + _x, offsetTop)
            return this.calcPosition(frameWidth - _x, (frameWidth - _x) / rate,  offsetLeft + _x, offsetTop + _x / rate)
        }
    },

    handleDrag(e){
        if (this.state.dragging) {
            let {action} = this.state;
            if (!action) return this.createNewFrame(e)
            if (action == 'move') return this.frameMove(e)
            this.frameDotMove(action, e)
        }
    },

    frameMove(e){
        const {originX, originY, startX, startY, frameWidth, frameHeight, maxLeft, maxTop} = this.state;
        let _x = e.pageX - startX + originX;
        let _y = e.pageY - startY + originY;
        if (e.pageX < 0 || e.pageY < 0) return false;
        if (_x > maxLeft) _x = maxLeft;
        if (_y > maxTop) _y = maxTop;
        this.calcPosition(frameWidth, frameHeight, _x, _y)
    },

    handleDragStart(e){
        const action = e.target.getAttribute('data-action');
        const {pageX, pageY} = e;
        this.setState({
            startX: pageX,
            startY: pageY,
            dragging: true,
            action
        });
        if (!action) {
            let container = ReactDOM.findDOMNode(this.refs.container);
            const {offsetLeft, offsetTop} = container;
            this.setState({
                offsetLeft: pageX - offsetLeft,
                offsetTop: pageY - offsetTop,
                frameWidth: 2,
                frameHeight: 2,
            }, () => {
                this.calcPosition(2, 2, pageX - offsetLeft, pageY - offsetTop)
            });
        }
    },

    handleDragStop(e){
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
            action: null,
        });
    },

    componentWillUnmount() {
        document.removeEventListener('mousemove')
        document.removeEventListener('mousedown')
        document.removeEventListener('mouseup')
        document.removeEventListener('mouseleave')
    },

    frameDotMove(dir,e){
        const {pageX, pageY} = e;
        const {rate} = this.props;
        const {startX, startY, originX, originY, frameWidth, frameHeight} = this.state;

        if (pageY !== 0 && pageX !== 0) {
            const _x = pageX - startX;
            const _y = pageY - startY;
            let new_width = frameWidth + _x;
            let new_height = new_width;
            switch(dir){
                case 'ne':
                    return this.calcPosition(new_width, new_width/rate, originX, originY - _x / rate);
                case 'e':
                    return this.calcPosition(new_width, new_width/rate, originX, originY - _x / rate * 0.5);
                case 'se':
                    return this.calcPosition(new_width, new_width/rate, originX, originY);
                case 'n':
                    new_height = frameHeight - _y;
                    return this.calcPosition(new_height * rate, new_height, originX + _y * rate * 0.5, originY + _y);
                case 'nw':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, new_width/rate, originX + _x, originY + _x / rate);
                case 'w':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, new_width / rate, originX + _x, originY + _x / rate * 0.5);
                case 'sw':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, new_width / rate, originX + _x, originY);
                case 's':
                    new_height = frameHeight + _y;
                    return this.calcPosition(new_height * rate, new_height, originX - _y * rate * 0.5, originY);
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

    render() {
        let className = ['_cropper'];
        const {imgLoaded, dragging, img_height, img_width} = this.state;
        const {src, disabled} = this.props;

        if (imgLoaded) className.push('_loaded');
        if (dragging) className.push('_dragging');
        className = className.join(' ');
        if (disabled) className = '_cropper _disabled';
        const imageNode =  <div className="_source" ref="sourceNode">
                                <img src={src} crossOrigin ref='img' onLoad={this.imgOnload} 
                                width={img_width} height={img_height} />
                            </div>;

        const node = disabled ?
                <div className={className} ref='container' style={{'position': 'relative', 'height': img_height}}>
                    {imageNode}
                    <div className="_modal"></div>
                </div>
                : <div className={className} onMouseLeave={this.handleDragStop}
                     ref="container" onMouseMove={this.handleDrag} 
                     onMouseDown={this.handleDragStart} onMouseUp={this.handleDragStop}
                    style={{'position': 'relative', 'height': img_height}}>
                    {imageNode}
                    <div className="_modal"></div>
                    <div className="_frame" ref="frameNode">
                        <div className="_clone">
                            <img src={src} crossOrigin ref="cloneImg" width={img_width} height={img_height}/>
                        </div>
                        <span className="_move" data-action='move'></span>
                        <span className="_dot _dot-center" data-action="ne"></span>
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