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
        return {
            img_width: '100%',
            img_height: 'auto'
        };
    },

    initStyles(){
        const container = ReactDOM.findDOMNode(this.refs.container)
        this.setState({
            img_width: container.offsetWidth
        }, () => {
            // calc frame width height
            const {rate, width, originX, originY} = this.props;
            const fr_width = width;
            const fr_height = width / rate;
            // calc clone position
            this.calcFrameSize(width, width / rate, originX, originY)
        });
    },
    
    calcFrameSize(width, height, left, top){
        const {img_width, img_height} = this.state;
        const cloneNode = ReactDOM.findDOMNode(this.refs.cloneNode)
        const frameNode = ReactDOM.findDOMNode(this.refs.frameNode)
        const cloneImg = ReactDOM.findDOMNode(this.refs.cloneImg)
        if (left + width >= img_width) left = img_width - width -1;
        if (top + height >= img_height) top = img_height - height -1;
        cloneNode.setAttribute('style', `left:${left}px;top:${top}px;width:${width}px;height:${height}px`)
        frameNode.setAttribute('style', `display:block;left:${left}px;top:${top}px;width:${width}px;height:${height}px`)
        cloneImg.setAttribute('style', `margin-left:-${left}px;margin-top:-${top}px`)
    },

    imgOnload(){
        const img = ReactDOM.findDOMNode(this.refs.img)
        this.setState({
            img_height: img.offsetHeight
        }, () => this.initStyles());
    },

    handleDrag(e){
        console.log(e.pageX)
    },

    render() {
        return (
            <div ref="container" className="_cropper" style={{'position': 'relative', 'height': this.state.img_height}}>
                <div className="_source" ref="sourceNode">
                    <img src={this.props.src} ref='img' onLoad={this.imgOnload} width={this.state.img_width} height={this.state.img_height}/>
                </div>
                <div className="_modal"></div>
                <div className="_clone" ref="cloneNode">
                    <img src={this.props.src} ref="cloneImg" width={this.state.img_width}/>
                </div>
                <div className="_frame" ref="frameNode">
                    <span className="_line-v"></span>
                    <span className="_line-v"></span>
                    <span className="_line"></span>
                    <span className="_line"></span>
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