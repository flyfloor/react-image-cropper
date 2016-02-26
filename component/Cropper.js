import React from 'react';
import ReactDOM from 'react-dom';

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
        let { originX, originY } = this.props;
        return {
            img_width: '100%',
            img_height: 'auto',
            originX,
            originY,
            startX:0,
            startY: 0,
            dragging: false,
            maxLeft: 0,
            maxTop: 0,
        };
    },

    initStyles(){
        const container = ReactDOM.findDOMNode(this.refs.container)
        this.setState({
            img_width: container.offsetWidth
        }, () => {
            // calc frame width height
            let {rate, width, originX, originY} = this.props;
            const {img_width, img_height} = this.state;
            const fr_width = width;
            const fr_height = width / rate;
            const maxLeft = img_width - width;
            const maxTop = img_height - fr_height;

            this.setState({
                maxLeft,
                maxTop
            });

            if (originX + width >= img_width) {
                originX = img_width - width;
                this.setState({
                    originX,
                });
            }
            if (originY + fr_height >= img_height) {
                originY = img_height - fr_height;
                this.setState({
                    originY
                });
            }
            // calc clone position
            this.calcPosition(width, fr_height, originX, originY)
        });
    },

    calcPosition(width, height, left, top){
        const frameNode = ReactDOM.findDOMNode(this.refs.frameNode)
        const cloneImg = ReactDOM.findDOMNode(this.refs.cloneImg)
       
        frameNode.setAttribute('style', `display:block;left:${left}px;top:${top}px;width:${width}px;height:${height}px`)
        cloneImg.setAttribute('style', `margin-left:${-left}px;margin-top:${-top}px`)
    },

    computeStyles(left, top){

    },

    imgOnload(){
        const img = ReactDOM.findDOMNode(this.refs.img)
        this.setState({
            img_height: img.offsetHeight
        }, () => this.initStyles());
    },

    handleDrag(e){
        let _x = e.pageX - this.state.startX;
        let _y = e.pageY - this.state.startY;
        const {width, rate} = this.props;
        const {originX, originY} = this.state;
        if (e.pageY !== 0 && e.pageX !== 0) {
            this.inBoundCalc(width, width/rate, _x + originX, _y + originY)
        }
    },

    inBoundCalc(width, height, left, top){
        let {img_width, img_height, maxLeft, maxTop} = this.state;
        if (left < 0) left = 0;
        if (top < 0) top = 0;
        if (left > maxLeft) left = maxLeft;
        if (top > maxTop) top = maxTop;
        this.calcPosition(width, height, left, top)
    },

    handleDragStart(e){
        this.setState({
            startX: e.pageX,
            startY: e.pageY,
            dragging: true,
        });
        // for firefox not fire drag other events
        e.dataTransfer.setData('text/plain', '');
    },

    handleDragStop(e){
        const frameNode = ReactDOM.findDOMNode(this.refs.frameNode)
        let {offsetLeft, offsetTop} = frameNode;
        this.setState({
            originX: offsetLeft,
            originY: offsetTop,
            dragging: false
        });
    },

    render() {
        return (
            <div ref="container" className={this.state.dragging ? '_cropper _dragging' : '_cropper'} style={{'position': 'relative', 'height': this.state.img_height}}>
                <div className="_source" ref="sourceNode">
                    <img src={this.props.src} ref='img' onLoad={this.imgOnload} width={this.state.img_width} height={this.state.img_height}/>
                </div>
                <div className="_modal"></div>
                <div className="_frame" ref="frameNode">
                    <div className="_clone">
                        <img src={this.props.src} ref="cloneImg" width={this.state.img_width}/>
                    </div>
                    <span className="_move" draggable onDrag={this.handleDrag} onDragStart={this.handleDragStart} onDragEnd={this.handleDragStop}></span>
                    <span className="_dot _dot-ne"></span>
                    <span className="_dot _dot-n"></span>
                    <span className="_dot _dot-nw"></span>
                    <span className="_dot _dot-e"></span>
                    <span className="_dot _dot-center"></span>
                    <span className="_dot _dot-w"></span>
                    <span className="_dot _dot-se"></span>
                    <span className="_dot _dot-s"></span>
                    <span className="_dot _dot-sw"></span>
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

export default Cropper