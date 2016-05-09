## React Image Cropper

A image cropper, use React.js

**[See the demo](http://braavos.me/react-image-cropper/)**

Custom:

+ initial cropper frame position 
+ frame width, height, rate
+ crop event

### Hot to Use

+ `import {Cropper} from 'react-image-cropper'`

+ copy and paste demo/cropper.less

+ define Cropper with src, and ref to execute crop method  

```
<Cropper src="http://braavos.me/images/posts/college-rock/the-smiths.png" ref="cropper"/>
```

+ crop and get image url

`image.src = this.refs.cropper.crop()`

+ costom use

| prop  |  value   |
|:-------:|:--------|
| rate | width / height |
| width | cropper frame width |
| originX | cropper original position(x axis)|
| originY | cropper original position(Y axis)|


**[See the demo](http://braavos.me/react-image-cropper/)**

