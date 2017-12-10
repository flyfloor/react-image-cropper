import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Css from './demo.less';
import Cropper from '../component/Cropper';


class ImageCropDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: '',
            imageLoaded: false,
            image1: '',
            imageL1oaded: false,
            image2: '',
            image2Loaded: false,
            image3: '',
            image3Loaded: false,
            image4: '',
            image4Loaded: false,
            image4BeforeLoaded: false,
            image4Values: ''
        }
    }

    handleImageLoaded(state){
        this.setState({
            [state + 'Loaded']: true
        });
    }

    handleBeforeImageLoad(state){
        this.setState({
            [state + 'BeforeLoaded']: true
        });
    }

    handleClick(state){
        let node = this[state];
        this.setState({
            [state]: node.crop()
        });
    }

    handleChange(state, values){
        this.setState({
            [state + 'Values']: values
        });
    }

    handleGetValues(state){
        let node = this[state];
        this.setState({
            [state + 'Values']: node.values()
        });
    }

    render() {
        const DemoImg = 'https://braavos.me/react-image-cropper/dist/image/demo.jpg'
        return (
            <ul>
                <li>
                    <h3>Default image crop</h3>
                    <Cropper src={DemoImg} 
                        ref={ref => this.image = ref} 
                        onImgLoad={() => this.handleImageLoaded('image')}/>
                    <br/>
                    {this.state.imageLoaded ? <button onClick={() => this.handleClick('image')}>crop</button> : null}
                    <h4>after crop</h4>
                    {this.state.image ? <img src={this.state.image} alt=""/> : null}
                </li>
                <li>
                    <h3>With given origin X and Y</h3>
                    <Cropper 
                        src={DemoImg} originX={100} originY={100} 
                        ref={ref => this.image1 = ref}
                        onImgLoad={() => this.handleImageLoaded('image1')}/>

                    {this.state.image1Loaded ? <button onClick={() => this.handleClick('image1')}>crop</button> : null}
                    <br/>
                    <h4>after crop</h4>
                    {this.state.image1 ? <img src={this.state.image1} alt=""/> : null}
                </li>
                <li>
                    <h3>With given ratio</h3>
                    <Cropper 
                        src={DemoImg} 
                        ratio={16 / 9} 
                        width={300} 
                        ref={ref => this.image2 = ref}
                        onImgLoad={() => this.handleImageLoaded('image2')}/>
                    <br/>
                    {this.state.image2Loaded ? <button onClick={() => this.handleClick('image2')}>crop</button> : null}
                    <h4>after crop</h4>
                    {this.state.image2 ? <img src={this.state.image2} alt=""/> : null}
                </li>
                <li>
                    <h3>Disabled</h3>
                    <Cropper 
                        src={DemoImg} 
                        ref={ref => this.image3 = ref} 
                        disabled={true}/>
                </li>
                <li>
                    <h3>{`Variable width and height, cropper frame is relative to natural image size, don't allow new
                        selection, set custom styles`}</h3>
                    <Cropper src={DemoImg}
                             width={200}
                             height={500}
                             originX={200}
                             originY={50}
                             fixedRatio={false}
                             allowNewSelection={false}
                             onChange={values => this.handleChange('image4', values)}
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
                             ref={ref => this.image4 = ref}
                             onImgLoad={() => this.handleImageLoaded('image4')}
                             beforeImgLoad={() => this.handleBeforeImageLoad('image4')}
                    />
                    <br/>
                    {this.state.image4BeforeLoaded ?
                        <button onClick={() => this.handleGetValues('image4')}>values</button> : null}
                    <h4>values</h4>
                    {this.state.image4Values ? <p>{JSON.stringify(this.state.image4Values)}</p> : null}
                    {this.state.image4Loaded ? <button onClick={() => this.handleClick('image4')}>crop</button> : null}
                    <h4>after crop</h4>
                    {this.state.image4 ? <img src={this.state.image4} alt=""/> : null}
                </li>
            </ul>
        );
    }
}

if (module.hot) {
    module.hot.accept()
}

ReactDOM.render(<ImageCropDemo/>, document.getElementById('root'))
