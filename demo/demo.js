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
        let node = this.refs[state];
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
        const src="http://braavos.me/react-image-cropper/dist/test.jpg";
        return (
            <ul>
                <li>
                    <h3>Default image crop</h3>
                    <Cropper src={src} ref="image"/>
                    <br/>
                    <button onClick={() => this.OnClick('image')}>crop</button>
                    <h4>after crop</h4>
                    {this.state.image ?  <img width="200" src={this.state.image} alt=""/>: null}
                </li>
                <li>
                    <h3>With given origin X and Y</h3>
                    <Cropper src={src} originX={100} originY={100} ref="image1"/>
                    <button onClick={() => this.OnClick('image1')}>crop</button>
                    <br/>
                    <h4>after crop</h4>
                    {this.state.image1 ? <img width="200" src={this.state.image1} alt=""/>: null}
                </li>
                <li>
                    <h3>With given rate</h3>
                    <Cropper src={src} rate={16/9} width={500} ref="image2"/>
                    <br/>
                    <button onClick={() => this.OnClick('image2')}>crop</button>
                    <h4>after crop</h4>
                    {this.state.image2 ? <img width="200" src={this.state.image2} alt=""/>: null}
                </li>
                <li>
                    <h3>Disabled</h3>
                    <Cropper src={src} ref="image3" disabled={true}/>
                    <br/>
                    <button onClick={() => this.OnClick('image3')}>crop</button>
                </li>
            </ul>
        );
    }
});


ReactDOM.render(<ImageCropDemo/>, document.getElementById('root'))
