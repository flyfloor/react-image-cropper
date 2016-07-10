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
            image4: '',
            image4Values: ''
        };
    },

    OnClick(state){
        let node = this.refs[state];
        this.setState({
            [state]: node.crop()
        });
    },

    OnClickValues(state){
        let node = this.refs[state];
        this.setState({
            [state + 'Values']: node.values()
        });
        console.log(state + 'Values');
    },

    render() {
        const src = "demo.jpg";
        return (
            <ul>
                <li>
                    <h3>Default image crop</h3>
                    <Cropper src={src} ref="image"/>
                    <br/>
                    <button onClick={() => this.OnClick('image')}>crop</button>
                    <h4>after crop</h4>
                    {this.state.image ? <img width="200" src={this.state.image} alt=""/> : null}
                </li>
                <li>
                    <h3>With given origin X and Y</h3>
                    <Cropper src={src} originX={100} originY={100} ref="image1"/>
                    <button onClick={() => this.OnClick('image1')}>crop</button>
                    <br/>
                    <h4>after crop</h4>
                    {this.state.image1 ? <img width="200" src={this.state.image1} alt=""/> : null}
                </li>
                <li>
                    <h3>With given rate</h3>
                    <Cropper src={src} rate={16 / 9} width={500} ref="image2"/>
                    <br/>
                    <button onClick={() => this.OnClick('image2')}>crop</button>
                    <h4>after crop</h4>
                    {this.state.image2 ? <img width="200" src={this.state.image2} alt=""/> : null}
                </li>
                <li>
                    <h3>Disabled</h3>
                    <Cropper src={src} ref="image3" disabled={true}/>
                    <br/>
                    <button onClick={() => this.OnClick('image3')}>crop</button>
                </li>
                <li>
                    <h3>Variable width and height, don't allow new selection, and set custom styles</h3>
                    <Cropper src={src}
                             width={507}
                             height={1113}
                             originX={210}
                             originY={147}
                             fixedRatio={false}
                             allowNewSelection={false}
                             styles={{
                                 source_img: {
                                     WebkitFilter: 'blur(3.5px)',
                                     filter: 'blur(3.5px)'
                                 },
                                 modal: {
                                     opacity: 0.5,
                                     backgroundColor: '#fff'
                                 },
                                 dotInner: {
                                     borderColor: '#ff0000'
                                 },
                                 dotInnerCenterVertical: {
                                     backgroundColor: '#ff0000'
                                 },
                                 dotInnerCenterHorizontal: {
                                     backgroundColor: '#ff0000'
                                 }
                             }}
                             ref="image4"/>
                    <br/>
                    <button onClick={() => this.OnClickValues('image4')}>values</button>
                    <h4>values</h4>
                    {this.state.image4Values ? <p>{JSON.stringify(this.state.image4Values)}</p> : null}
                    <button onClick={() => this.OnClick('image4')}>crop</button>
                    <h4>after crop</h4>
                    {this.state.image4 ? <img width="200" src={this.state.image4} alt=""/> : null}
                </li>
            </ul>
        );
    }
});


ReactDOM.render(<ImageCropDemo/>, document.getElementById('root'))
