import React from 'react';
import ReactDOM from 'react-dom';
import Css from './demo.less';
import Cropper from '../component/Cropper';

const ImageCropDemo = React.createClass({
    getInitialState() {
        return {
            image: '',
            image1: '',
            image2: '',
            image3: '',
        };
    },

    OnClick(state){
        let node = this.refs.cropper;
        this.setState({
            [state]: node.crop()
        });
    },

    handleMove(coords){
        const previewNode = ReactDOM.findDOMNode(this.refs.previewNode)
        const previewHolder = ReactDOM.findDOMNode(this.refs.previewHolder)
        const {left, top, width, height} = coords;
        previewNode.setAttribute('style', `margin-left:${-left}px;margin-top:${-top}px;width: ${500 / width}%`)
    },

    render() {
        return (
            <ul>
                <li>
                    <h3>Default image crop</h3>
                    <Cropper src="http://braavos.me/images/posts/college-rock/the-smiths.png" ref="cropper"/>
                    <br/>
                    <button onClick={() => this.OnClick('image')}>crop</button>
                    <h4>after crop</h4>
                    {this.state.image ?  <img width="200" src={this.state.image} alt=""/>: null}
                </li>
                {/*<li>
                    <h3>With given origin X and Y</h3>
                    <Cropper src="http://braavos.me/images/posts/college-rock/the-smiths.png" onCrop={(img, croods) => this.OnClick(img, croods, 'image1')}  originX={100} originY={100}/>
                    <h4>after crop</h4>
                    {this.state.image1 ? `<img src="${this.state.image1}" alt=""/>`: null}
                </li>
                <li>
                    <h3>With given rate</h3>
                    <Cropper src="http://braavos.me/images/posts/college-rock/the-smiths.png" rate={2} onCrop={(img) => this.OnClick(img, 'image2')}/>
                    <h4>after crop</h4>
                    {this.state.image1 ? `<img src="${this.state.image1}" alt=""/>`: null}
                </li>*/}
            </ul>
        );
    }
});


ReactDOM.render(<ImageCropDemo/>, document.getElementById('root'))
