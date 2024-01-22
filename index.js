require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlparser = require('url');
let URL;
let mongoose;
try {
    mongoose = require("mongoose");
} catch (e) {
    console.log(e);
}

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(r => {
    console.log("Connected to DB!");
    console.log("Mongoose version:", mongoose.version);
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

const urlSchema = new mongoose.Schema({
    original_url: String,
    short_url: {
        type: Number,
        default: 1
    }
});

URL = mongoose.model('URLShortener', urlSchema);

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function (req, res) {
    console.log(req.body);
    const bodyurl = req.body.url;
    dns.lookup(urlparser.parse(bodyurl).hostname, (err, address) => {
        if (!address) {
            res.json({error: 'invalid url'});
        } else {
            let shortUrl = Math.floor(Math.random() * 100000);
            console.log(shortUrl);
            const url = new URL({
                original_url: bodyurl,
                short_url: 1
            });
            url.save().then((err, data) => {
                if (err) return console.log(err);
                res.json({
                    original_url: data.original_url,
                    short_url: data.shorturl
                });
            });
        }
    });
});

app.get('/api/shorturl/:id', function (req, res) {
    const id = req.params.id;

    URL.findOne({short_url: id}).then((err, data) => {
        if (err) return console.log(err);
        if (!data) {
            res.json({error: "Invalid URL"});
        } else {
            res.redirect(data.original_url);
        }
        done(null, data);
    });
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
    res.json({greeting: 'hello API'});
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});

