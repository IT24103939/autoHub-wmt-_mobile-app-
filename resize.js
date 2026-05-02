const Jimp = require('jimp');

async function resizeImage() {
  try {
    const image = await Jimp.read('d:/wmt/assets/Gemini_Generated_Image_j41w25j41w25j41w.png');
    await image.resize(1024, 1024); // Resize to a standard icon size
    await image.writeAsync('d:/wmt/assets/Gemini_Generated_Image_j41w25j41w25j41w.png'); // overwrite
    console.log('Image resized successfully!');
  } catch (err) {
    console.error(err);
  }
}

resizeImage();
