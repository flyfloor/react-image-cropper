## React Image Cropper

[![Downloads](https://img.shields.io/npm/dt/react-image-cropper.svg)](https://www.npmjs.com/package/react-image-cropper)
[![Version](https://img.shields.io/npm/v/react-image-cropper.svg)](https://www.npmjs.com/package/react-image-cropper)

A React.JS Image Cropper
Touch supported

**[See the demo](http://braavos.me/react-image-cropper/)**

Custom:

+ initial cropper frame position 
+ frame width, height, ratio
+ crop event

### Hot to Use

+ `import {Cropper} from 'react-image-cropper'`

+ styles are all inline

+ define Cropper with src, and ref to execute crop method  

```
<Cropper 
    src="http://braavos.me/images/posts/college-rock/the-smiths.png" 
    ref={ ref => { this.cropper = ref }}
/>
```

+ crop and get image url

`image.src = this.cropper.crop()`

+ get crop values:

`const values = this.cropper.values()`

values: 

```
{
    // display values
    display: {
        width, // frame width
        height, // frame height
        x, // original x position
        y, // original y position
        imgWidth, // img width
        imgHeight, // img height
    },
    // original values
    original: {
        width, // frame width
        height, // frame height
        x, // original x position
        y, // original y position
        imgWidth, // img width
        imgHeight, // img height
    }
}
```


+ onChange for preview

(values) => onChange(values)

+ custom use

| prop  |  value   |
|:-------:|:--------|
| ratio | width / height |
| width | cropper frame width |
| height | cropper frame height |
| originX | cropper original position(x axis), accroding to image left|
| originY | cropper original position(Y axis), accroding to image top|
| fixedRatio | turn on/off fixed ratio (bool default true) |
| allowNewSelection | allow user to create a new selection instead of reusing initial selection (bool default true) |
| styles | specify styles to override inline styles |
| onImgLoad | specify fuction callback to run when the image completed loading |
| beforeImgload | specify function callback to run when the image size value is ready but image is not completed loading |
| onChange | triggred when dragging stop, get values of cropper |


**[See the demo](http://braavos.me/react-image-cropper/)**

