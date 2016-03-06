const React = require('react');
const ReactDOM = require('react-dom');

const Cropper = React.createClass({
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
            let {originX, originY} = this.props;
            const {img_width, img_height, frameWidth, frameHeight} = this.state;
            const maxLeft = img_width - frameWidth;
            const maxTop = img_height - frameHeight;


            if (originX + frameWidth >= img_width) {
                originX = img_width - frameWidth;
                this.setState({
                    originX,
                });
            }
            if (originY + frameHeight >= img_height) {
                originY = img_height - frameHeight;
                this.setState({
                    originY
                });
            }

            this.setState({  
                maxLeft, 
                maxTop, 
                imgLoaded: true 
            });
            // calc clone position
            this.calcPosition(frameWidth, frameHeight, originX, originY)

        });
    },

    calcPosition(width, height, left, top){
        const frameNode = ReactDOM.findDOMNode(this.refs.frameNode)
        const cloneImg = ReactDOM.findDOMNode(this.refs.cloneImg)
        const {img_width, img_height} = this.state;

        if (left < 0) left = 0;
        if (top < 0) top = 0;
        if (width + left > img_width) left = img_width - width;
        if (height + top > img_height) top = img_height - height;
        if (width < 0 || height < 0 || height > img_height) return false;

        if (this.props.onCrop) this.props.onCrop(this.props.src, {left, top, width, height})
       
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
            let {pageX, pageY} = e;
            const {rate} = this.props;
            const {frameWidth, startX, startY, offsetLeft, offsetTop} = this.state;

            let _x = pageX - startX;
            let _y = pageY - startY;
            let _width, _height, _left, _top;
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
        let action = e.target.getAttribute('data-action');
        let {pageX, pageY} = e;
        this.setState({
            startX: pageX,
            startY: pageY,
            dragging: true,
            action
        });
        if (!action) {
            let container = ReactDOM.findDOMNode(this.refs.container)
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
            let _x = pageX - startX;
            let _y = pageY - startY;
            let new_width = frameWidth + _x;
            switch(dir){
                case 'ne':
                    return this.calcPosition(new_width, new_width/rate, originX, originY - _x / rate)
                case 'e':
                    return this.calcPosition(new_width, new_width/rate, originX, originY - _x / rate * .5)
                case 'se':
                    return this.calcPosition(new_width, new_width/rate, originX, originY)
                case 'n':
                    let new_height = frameHeight - _y;
                    return this.calcPosition(new_height * rate, new_height, originX + _y * rate * .5, originY + _y)
                case 'nw':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, new_width/rate, originX + _x, originY + _x / rate)
                case 'w':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, new_width / rate, originX + _x, originY + _x / rate * .5)
                case 'sw':
                    new_width = frameWidth - _x;
                    return this.calcPosition(new_width, new_width / rate, originX + _x, originY)
                case 's':
                    new_height = frameHeight + _y;
                    return this.calcPosition(new_height * rate, new_height, originX - _y * rate * .5, originY)
                default:
                    return
            }
        }
    },

    crop(){
        const {frameWidth, frameHeight, originX, originY} = this.state;
        let canvas = document.createElement('canvas');
        let img = ReactDOM.findDOMNode(this.refs.img);
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        canvas.getContext("2d").drawImage(img, originX, originY, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight)
        return canvas.toDataURL();
    },

    render() {
        let className = '_cropper';
        if (this.state.imgLoaded) className += ' _loaded';
        if (this.state.dragging) className = `${className} _dragging`;
        return (
            <div className={className} onMouseLeave={this.handleDragStop}
                 ref="container" onMouseMove={this.handleDrag} 
                 onMouseDown={this.handleDragStart} onMouseUp={this.handleDragStop}
                style={{'position': 'relative', 'height': this.state.img_height}}>
                <div className="_source" ref="sourceNode">
                    <img src={this.props.src} crossOrigin ref='img' onLoad={this.imgOnload} width={this.state.img_width} height={this.state.img_height}/>
                </div>
                <div className="_modal"></div>
                <div className="_frame" ref="frameNode">
                    <div className="_clone">
                        <img src={this.props.src} crossOrigin ref="cloneImg" width={this.state.img_width}/>
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
                </div>
            </div>
        );
    }
});

Cropper.propTypes = {
    src: React.PropTypes.string.isRequired,
    originX: React.PropTypes.number,
    originY: React.PropTypes.number,
    rate: React.PropTypes.number,
    width: React.PropTypes.number,
}

module.exports = Cropper