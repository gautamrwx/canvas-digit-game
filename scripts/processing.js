
var model;

async function loadTFModel() {
    model = await tf.loadGraphModel('TFJS/model.json')
}

function processCanvas() {
    // #1 Open Image from canvas
    let image = cv.imread(canvas);

    // #2 convert to black & white , Increase contrast by changing thresold
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);

    // #3 Find the contours / Outlining of image
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    // #4 Calculate bounding rectangle (Crop the contour area )
    let cnt = contours.get(0);
    let rect = cv.boundingRect(cnt);
    image = image.roi(rect);

    // #5 resize cropped image (Adjust height and width with scale factor)
    // image is of 28*28 size [20 H/W + 4 P + 4 P]
    var height = image.rows;
    var width = image.cols;

    if (height > width) {
        height = 20;
        const scaleFactor = image.rows / height;
        width = Math.round(image.cols / scaleFactor);
    } else {
        width = 20;
        const scaleFactor = image.cols / width;
        height = Math.round(image.rows / scaleFactor);
    }

    let newSize = new cv.Size(width, height);
    cv.resize(image, image, newSize, 0, 0, cv.INTER_AREA)

    // #6 Adding Borders {4+4+4+4} as padding
    const LEFT = Math.ceil(4 + (20 - width) / 2);
    const RIGHT = Math.floor(4 + (20 - width) / 2);
    const TOP = Math.ceil(4 + (20 - height) / 2);
    const BOTTOM = Math.floor(4 + (20 - height) / 2);

    const BLACK = new cv.Scalar(0, 0, 0, 0);
    cv.copyMakeBorder(image, image, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, BLACK);

    // #7 Finding Centre of Mass for shifting
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cnt = contours.get(0);
    const Moments = cv.moments(cnt, false);

    const cx = Moments.m10 / Moments.m00;
    const cy = Moments.m01 / Moments.m00;

    // #8 Shift Centre of mass toward centre
    const X_SHIFT = Math.round(image.cols / 2.0 - cx);
    const Y_SHIFT = Math.round(image.rows / 2.0 - cy);

    newSize = new cv.Size(image.cols, image.rows);
    const M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
    cv.warpAffine(image, image, M, newSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK);

    // #9 Noarmalise the image (Dividing by 255.0)
    let pixelValues = image.data;
    pixelValues = Float32Array.from(pixelValues);

    pixelValues = pixelValues.map(function (item) {
        return item / 255.0;
    });

    // Cleanup
    image.delete();
    contours.delete();
    cnt.delete();
    hierarchy.delete();
    M.delete();

    return pixelValues;
}

function predictImage() {
    // Creating a Tensor
    var pixelValues = processCanvas()
    const X = tf.tensor([pixelValues]);

    // Predicting Image
    const result = model.predict(X);
    result.print();
    const output = result.dataSync()[0];

    // Cleanup 
    X.dispose();
    result.dispose();

    return output;
}