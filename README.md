## React Image Cropper

[![Downloads](https://img.shields.io/npm/dt/react-image-cropper.svg)](https://www.npmjs.com/package/react-image-cropper)
[![Version](https://img.shields.io/npm/v/react-image-cropper.svg)](https://www.npmjs.com/package/react-image-cropper)

A image cropper, use React.js

**[See the demo](http://braavos.me/react-image-cropper/)**

Custom:

+ initial cropper frame position 
+ frame width, height, rate
+ crop event

### Hot to Use

+ `import {Cropper} from 'react-image-cropper'`

+ define Cropper with src, and ref to execute crop method  

```
<Cropper src="http://braavos.me/images/posts/college-rock/the-smiths.png" ref="cropper"/>
```

+ crop and get image url

`image.src = this.refs.cropper.crop()`

+ get crop values

`var values = this.refs.cropper.values()`

+ custom use

| prop  |  value   |
|:-------:|:--------|
| rate | width / height |
| width | cropper frame width |
| height | cropper frame height |
| fixedRatio | turn on/off fixed ratio (bool default true) |
| allowNewSelection | allow user to create a new selection instead of reusing initial selection (bool default true) |
| originX | cropper original position(x axis)|
| originY | cropper original position(Y axis)|


**[See the demo](http://braavos.me/react-image-cropper/)**

