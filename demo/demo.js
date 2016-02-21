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

    handleCrop(img, state){
        this.setState({
            [String(state)]: img
        });
    },

    handleResize(img, coords){
        console.log(coords)
    },

    render() {
        return (
            <ul>
                <li>
                    <h3>Default image crop</h3>
                    <Cropper src="http://braavos.me/images/posts/college-rock/the-smiths.png"
                         onCrop={(img) => this.handleCrop(img, 'image')} originX={100} originY={200} onResie={this.handleResize}/>
                    <h4>after crop</h4>
                    {this.state.image ? `<img src="${this.state.image}" alt=""/>`: null}
                </li>
                {/*<li>
                    <h3>With given origin X and Y</h3>
                    <Cropper src="http://braavos.me/images/posts/college-rock/the-smiths.png" onCrop={(img) => this.handleCrop(img, 'image1')}  originX={100} originY={100}/>
                    <h4>after crop</h4>
                    {this.state.image1 ? `<img src="${this.state.image1}" alt=""/>`: null}
                </li>
                /*<li>
                    <h3>With given origin X and Y</h3>
                    <Cropper src="http://braavos.me/images/posts/college-rock/the-smiths.png" rate={2} onCrop={(img) => this.handleCrop(img, 'image2')}/>
                    <h4>after crop</h4>
                    {this.state.image1 ? `<img src="${this.state.image1}" alt=""/>`: null}
                </li>
                <li>
                    <h3>Allow resize with different size</h3>
                    <Cropper src="http://braavos.me/images/posts/college-rock/the-smiths.png" onCrop={(img) => this.handleCrop(img, 'image3')} options={options1}/>
                    <h4>after crop</h4>
                    {this.state.image2 ? `<img src="${this.state.image2}" alt=""/>`: null}
                </li>*/}
            </ul>
        );
    }
});


ReactDOM.render(<ImageCropDemo/>, document.getElementById('root'))
