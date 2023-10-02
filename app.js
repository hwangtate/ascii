const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));  // 'public' 디렉토리에서 정적 파일을 제공합니다.

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 8 * 1024 * 1024,  // 2 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'), false);
        }
    }
});

const ASCII_CHARS = ".:-=+*%@#";

async function imageToAscii(buffer) {
    let asciiImage = '';
    const image = await Jimp.read(buffer);
    image.resize(100, 50).greyscale();

    for (let y = 0; y < image.bitmap.height; y++) {
        let asciiRow = '';
        for (let x = 0; x < image.bitmap.width; x++) {
            const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
            const avgValue = (pixel.r + pixel.g + pixel.b) / 3;
            asciiRow += ASCII_CHARS[Math.floor(avgValue / (255 / (ASCII_CHARS.length - 1)))];
        }
        asciiImage += asciiRow + '\n';
    }
    return asciiImage;
}

app.get('/', (req, res) => {
  res.render('index', { asciiArt: null });
});

app.get('/privacy', (req, res) => {
  res.sendFile(__dirname + '/public/privacy.html');
});

app.get('/meme', (req, res) => {
  res.sendFile(__dirname + '/public/meme.html');
});

app.get('/cat', (req, res) => {
  res.sendFile(__dirname + '/public/cat.html');
});

app.get('/dog', (req, res) => {
  res.sendFile(__dirname + '/public/dog.html');
});

app.get('/person', (req, res) => {
  res.sendFile(__dirname + '/public/person.html');
});

app.get('/animal', (req, res) => {
  res.sendFile(__dirname + '/public/animal.html');
});

app.get('/baby', (req, res) => {
  res.sendFile(__dirname + '/public/baby.html');
});

app.get('/best', (req, res) => {
  res.sendFile(__dirname + '/public/best.html');
});

app.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
      return res.render('index', { asciiArt: 'No image uploaded' });
  }

  try {
      const asciiResult = await imageToAscii(req.file.buffer);
      
      // 여기에 검증 로직 추가
      if (!asciiResult || asciiResult.trim() === '') {
          return res.render('index', { asciiArt: 'Failed to generate ASCII art. Please try again.' });
      }
      
      res.render('index', { asciiArt: asciiResult });
  } catch (err) {
      console.error(err);
      res.render('index', { asciiArt: 'Server error' });
  }
});

app.use((err, req, res, next) => {
    if (err) {
        console.error(err);
        return res.render('index', { asciiArt: 'Invalid input. Please upload a valid image file.' });
    }
    next();
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
