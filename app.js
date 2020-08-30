var nodemailer = require('nodemailer');
const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs')
const multer = require('multer')
const loadingSpinner = require('loading-spinner');
require('dotenv').config()

const app = express()
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'))
app.use(bodyParser.json())

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./attachments");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname + "_" + Date.now());
  }
});

var upload = multer({
  storage: Storage
});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  // your Gmail mailid and password
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASS
  }
});

var mailOptions;

app.get('/', (req, res) => {
  res.sendFile('/index.html')
})

app.post('/sendemail', upload.array("attachments", 10), (req, res) => {
  loadingSpinner.start(100, {
    clearChar: true
  });
  var attachments_arr = []
  req.files.forEach((file => {
    attachments_arr.push({
      filename: file.originalname,
      path: file.path
    });
  }));
  console.log(attachments_arr);
  mailOptions = {
    from: 'YOUR MAIL',
    to: req.body.to,
    subject: req.body.subject,
    text: req.body.body,
    attachments: attachments_arr
  };

  transporter.sendMail(mailOptions).then(info => {
    console.log(info);
    attachments_arr.forEach((file) => {
      fs.unlink(file.path, err => {
        if (err) return res.end(err)
      })
    });
    loadingSpinner.stop();
    res.redirect('/result.html');
  }).catch(err => console.error(err))
})

// listening...
var port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`App started on Port ${port}`)
});