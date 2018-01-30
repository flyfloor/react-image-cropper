import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './demo.less'
import Cropper from '../component/Cropper'

const DemoImg = 'https://braavos.me/images/posts/gr/8.jpg'

class ImageCropDemo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imgSrc: DemoImg,
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

  handleImageLoaded (state) {
    this.setState({
      [state + 'Loaded']: true
    })
  }

  handleBeforeImageLoad (state) {
    this.setState({
      [state + 'BeforeLoaded']: true
    })
  }

  handleClick (state) {
    let node = this[state]
    this.setState({
      [state]: node.crop()
    })
  }

  handleChange (state, values) {
    this.setState({
      [state + 'Values']: values
    })
  }

  handleGetValues (state) {
    let node = this[state]
    this.setState({
      [state + 'Values']: node.values()
    })
  }

  render () {
    return (
      <ul>
        <li>
          <h3>Default image crop</h3>
          <Cropper src={this.state.imgSrc}
            ref={ref => { this.image = ref }}
            onImgLoad={() => this.handleImageLoaded('image')}
          />
          <br/>
          {
            this.state.imageLoaded
              ? <button
                onClick={() => this.handleClick('image')}
              >
              crop
              </button>
              : null
          }
          <h4>after crop</h4>
          {
            this.state.image
              ? <img
                className="after-img"
                src={this.state.image}
                alt=""
              />
              : null
          }
        </li>
        <li>
          <h3>With given origin X and Y</h3>
          <Cropper
            src={this.state.imgSrc}
            originX={100}
            originY={100}
            ref={ref => { this.image1 = ref }}
            onImgLoad={() => this.handleImageLoaded('image1')}
          />

          {
            this.state.image1Loaded
              ? <button
                onClick={() => this.handleClick('image1')}
              >
              crop
              </button>
              : null
          }
          <br/>
          <h4>after crop</h4>
          {
            this.state.image1
              ? <img
                className="after-img"
                src={this.state.image1}
                alt=""
              />
              : null
          }
        </li>
        <li>
          <h3>With given ratio</h3>
          <Cropper
            src={this.state.imgSrc}
            ratio={16 / 9}
            width={300}
            ref={ref => { this.image2 = ref }}
            onImgLoad={() => this.handleImageLoaded('image2')}
          />
          <br/>
          {
            this.state.image2Loaded
              ? <button
                onClick={() => this.handleClick('image2')}
              >
              crop
              </button>
              : null
          }
          <h4>after crop</h4>
          {
            this.state.image2
              ? <img
                className="after-img"
                src={this.state.image2}
                alt=""
              />
              : null
          }
        </li>
        <li>
          <h3>Disabled</h3>
          <Cropper
            src={this.state.imgSrc}
            ref={ref => { this.image3 = ref }}
            disabled
          />
        </li>
        <li>
          <h3>{`Variable width and height, cropper frame is relative to natural image size, don't allow new
                        selection, set custom styles`}</h3>
          <Cropper
            src={this.state.imgSrc}
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
            ref={ref => { this.image4 = ref }}
            onImgLoad={() => this.handleImageLoaded('image4')}
            beforeImgLoad={() => this.handleBeforeImageLoad('image4')}
          />
          <br/>
          {
            this.state.image4BeforeLoaded
              ? <button
                onClick={() => this.handleGetValues('image4')}
              >
              values
              </button>
              : null
          }
          <h4>values</h4>
          {
            this.state.image4Values
              ? <pre
                style={{
                  padding: '10px',
                  backgroundColor: '#eee',
                  overflow: 'scroll'
                }}
              >
                {JSON.stringify(this.state.image4Values)}
              </pre>
              : null
          }
          {
            this.state.image4Loaded
              ? <button
                onClick={() => this.handleClick('image4')}
              >
              crop
              </button>
              : null
          }
          <h4>after crop</h4>
          {
            this.state.image4
              ? <img
                className="after-img"
                src={this.state.image4}
                alt=""
              />
              : null
          }
        </li>
      </ul>
    )
  }
}

if (module.hot) {
  module.hot.accept()
}

ReactDOM.render(<ImageCropDemo/>, document.getElementById('root'))
