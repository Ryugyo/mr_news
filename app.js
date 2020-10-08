const express = require('express');
const app = express();
const assert = require('assert');
const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');
const cookie = require('cookie');
const url = 'mongodb://mongogo:GD56smgxE7uDtxGYd4ugPjD9mjmnDCGjO1GnvgZ7GGREXFVcXLJG3OGa4Sy0Y2vCxiepe7GYe1ofSKzu34HW5A==@mongogo.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@mongogo@';
const MongoClient = require('mongodb').MongoClient;
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const multer  = require('multer');
const bodyParser = require('body-parser');
const Parser = require('rss-parser');
const rssParser = new Parser();
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('d0b6e79fdd634f49a6efb5fe132df85a');
const nodemailer = require("nodemailer");
const uuid = require('uuid');
const validator = require("email-validator");
const tldjs = require('tldjs');
const { getDomain } = tldjs;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('frontend'));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.use(session({
    secret: 'please change this secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(function (req, res, next){
    let username = (req.session.username)? req.session.username : '';
    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
        path : '/', 
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    next();
});

let upload = multer({ dest: 'uploads/' });

// Create the Salt
function generateSalt(){
    return crypto.randomBytes(16).toString('base64');
}

// Create the Hash, using 'sha512'
function generateHash(password, salt){
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('base64');
}

// User class
let User = function(item, req, date){
    let salt = generateSalt();
    let hash = generateHash(item.password, salt);
    this.username = item.username;
    this.email = item.email;
    this.password = hash;
    this.salt = salt;
    this.file = req.file;
    this.allFollows = [];
    this.fileList = [];
    this.date = date;
    this.isVerfied = false;
    this.uuid = uuid.v1();
}

// Source class (News)
let Source = function(url, name, type, img, des) {
    this.url = url;
    this.name = name;
    this.type = type;
    this.img = img;
    this.des = des
}

// Feed property class
let feedProp = function (title, img, description) {
    this.title = title;
    this.img = img;
    this.description = description;
}

// Start up application with socket.io
app.post('/start/', function(req, res, err) {
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        let users = db.db('myproject').collection('users');
        let name = req.session.username;
        // Frequently check user's followlist, if news update, socket will send message to client
        let updateTime = new Date();
        setInterval(() => {
            let feedList = [];
            let userDate;
            users.findOne({username: name}, function(err, user){
                let allFollows = user.allFollows;
                for (var i = 0; i < allFollows.length; i ++) {
                    if (allFollows[i].type == "RSS Feed"){
                        feedList.push(allFollows[i].url);
                    }
                };
                userDate = user.date;
                for (var i = 0; i < feedList.length; i++) {
                    rssParser.parseURL(feedList[i], function(err, feed){
                        let items = feed.items;
                        let newsDate = new Date(items[0].pubDate);
                        if (+userDate <= +newsDate) {
                            // Update user's last update time
                            users.updateOne({username: name}, {$set: {date: new Date()}}, function(err, update){
                                serverInstance.sendMsg('current_user', 'news', "There are news update from: " + "\n" + feed.title);
                            });
                        }
                    });
                };
            });
            // Frequently check top news, if news update, socket will send message to client
            newsapi.v2.topHeadlines({
                country: 'ca'
            }).then(results => {
                if(results.status == "error") {
                    console.log(results[0].code);
                } else {
                    let newsResult = results.articles;
                    let topnewsDate = new Date(newsResult[0].publishedAt)
                    if (topnewsDate.getTime() !== updateTime.getTime()) {
                        serverInstance.sendMsg('current_user', 'news', "Top news updated! Check them out!");
                        updateTime = topnewsDate;
                    }
                }
            });
        }, 100000);
    });
});

// Socket send message to client when user subscribed
app.post('/MrNews/alert/', function(req, res, err) {
    serverInstance.sendMsg('current_user', 'news', "You have successfully subscribed to: " + "\n" + req.body.name);
});

// Send e-mail when user signup
let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "mrnewswebsite@gmail.com",
        pass: "mrnewsgmail"
    } 
 });

let mailopts, link, uid;

// User signup request
app.post('/MrNews/signup/', upload.single('pictures'), function(req, res, next) {
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        let collection = db.db('myproject').collection('users');
        if (err) return res.status(500).end(err);
        let name = req.body.username;
        let email = req.body.email;
        if(!validator.validate(email)) return res.status(409).end("Please use a valid email.");
        collection.findOne({username: name}, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user) return res.status(409).end("Username " + name + " already exists.");
            else {
                collection.findOne({email: email}, function(err, checkEmail) {
                    if (err) return res.status(500).end(err);
                    if (checkEmail) return res.status(409).end("Email " + email + " has already been used.")
                    let newUser = new User(req.body, req, new Date());
                    uid = newUser.uuid;
                    link = "http://" + req.get('host') + "/verify?uid=" + uid;
                    mailopts = {
                        to : email,
                        subject : "Thank you for using Mr.News! Please confirm your Email account",
                        html : "Hello,<br>Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
                    }
                    transporter.sendMail(mailopts);
                    collection.insertOne(newUser, function(err, res){
                        if (err) return res.end(err);
                        db.close();
                    });
                    return res.redirect('/');
                });
            }
        });
    });
});

// User login request
app.post('/MrNews/login/', function (req, res, next) {
    let name = req.body.username;
    let password = req.body.password;
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        if (err) return res.status(500).end(err);
        let users = db.db('myproject').collection('users');
        users.findOne({username: name}, function(err, user) {
            if (err) return res.status(500).end(err);
            if (!user) return res.status(401).end("Access Denied: User Does Not Exists.");
            if(!user.isVerfied) return res.status(500).end("Please confirm your email first.");
            if (user.password !== generateHash(password, user.salt)) return res.status(401).end("Access Denied: Password Not Correct.");
            req.session.username = user.username;
            db.close();
            return res.redirect('/userNews.html');
        });
    });
});

// Verify link sending by email
app.get('/verify', function (req, res) {
    if((req.protocol+"://"+req.get('host'))==("http://"+req.get('host'))) {
        if(req.query.uid == uid) {
            MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
                if (err) return res.end(err);
                let users = db.db('myproject').collection('users');
                users.updateOne({uuid: uid}, {$set: {isVerfied: true}}, function(err, update){
                    db.close();
                    res.status(200).end("<h1>E-Mail is verified!</h1>")
                });
            });
            res.redirect('/');
        }
        else {
            res.status(500).end("<h1>Bad Request</h1>");
        }
    }
    else {
        res.status(500).end("<h1>Request is from unknown source</h1>");
    }
});

// Upload and save user's avatar
app.get('/MrNews/users/image/', function(req, res, next){
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        if (err) return res.status(500).end(err);
        let collection = db.db('myproject').collection('users');
        collection.findOne({username: req.session.username}, function(err, item) {
            if (err) return res.status(500).end(err);
            if (!item) return res.status(404).end("Username " +  req.session.username + " image does not exists");
            let profile = item.file;
            res.setHeader('Content-Type', profile.mimetype);
            res.sendFile(profile.path, { root: __dirname });
            db.close();
        });
    });
});

// Get user's profile
app.get('/MrNews/users/profile/', function(req, res, next){
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        if (err) return res.status(500).end(err);
        let collection = db.db('myproject').collection('users');
        collection.findOne({username: req.session.username}, function(err, item) {
            if (err) return res.status(500).end(err);
            if (!item) return res.status(404).end("Username " + req.session.username + " profile does not exists");
            db.close();
            return res.json(item);
        });
    });
});

// User signout request
app.get('/MrNews/signout/', function (req, res, next) {
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    return res.redirect('/');
});

// Search by keyword
app.get('/MrNews/search/everything/:keyword/', function(req, res, err){
    let keyword =  req.params.keyword;
    newsapi.v2.everything({
        q: keyword,
        language: 'en'
    }).then(results => {
        if(results.status == "error") {
            return console.log(results.code);
        } else {
            return res.json(results);
        }
    });
});

// Search news source
app.get('/MrNews/search/source/', function(req, res, err){
    newsapi.v2.sources({
        language: 'en'
    }).then(results => {
        if(results.status == "error") {
            return console.log(results[0].code);
        } else {
            let returnList = [];
            let fullList = results.sources;
            for (var i = 0; i < 10; i ++) {
                let random = Math.floor(Math.random() * 100);
                let lastRandom = random;
                while (random === lastRandom) {
                    random = Math.floor(Math.random() * 100);
                }
                returnList.push(fullList[random]);
                lastRandom = random;
            }
            return res.json(returnList);
        }
    });
});

// Get top news in Canada
app.get('/MrNews/search/topline/', function(req, res, err){
    newsapi.v2.topHeadlines({
        country: 'ca'
    }).then(results => {
        if(results.status == "error") {
            console.log(results[0].code);
        } else {
            return res.json(results);
        }
    });
});

// Get news source in category
app.get('/MrNews/search/source/:category/', function(req, res, err){
    let category = req.params.category;
    newsapi.v2.sources({
        language: 'en',
        category: category
    }).then(results => {
        if(results.status == "error") {
            console.log(results[0].code);
        } else {
            let returnList = [];
            let fullList = results.sources;
            for (var i = 0; i < 5; i ++) {
                let random = Math.floor(Math.random() * 20);
                let lastRandom = random;
                while (random === lastRandom) {
                    random = Math.floor(Math.random() * 20);
                }
                returnList.push(fullList[random]);
                lastRandom = random;
            }
            return res.json(returnList);
        }
    });
});

// Get all news of given RSS url
app.post('/MrNews/newsList/', function(req, res, err) {
    if (req.body.source.type == "RSS Feed") {
        rssParser.parseURL(req.body.source.url, function(err, feed) {
            return res.json(feed);
        });
    }
    else {
        newsapi.v2.everything({
            domains: getDomain(req.body.source.url),
            language: 'en'
        }).then(results => {
            if(results.status == "error") {
                return console.log(results.code);
            } else {
                return res.json(results);
            }
        });
    }
});

// Get given feed's name
app.post('/MrNews/getProp/', function(req, res, err) {
    let url = req.body.url.trim();
    rssParser.parseURL(url, function(err, feed) {
        let title = ""
        let url = ""
        let description = ""
        if ( typeof feed.title !== 'undefined') {
            title = feed.title
        }
        if ( typeof feed.image !== 'undefined') {
            url = feed.image.url
        }
        if ( typeof feed.description !== 'undefined') {
            description = feed.description
        }
        let result = new feedProp(title, url, description);
        return res.json(result);
    });
});

// Get icon of given news source
app.post('/getImg/', function(req, res, err){
    let domain = getDomain(req.body.url);
    let img = ("https://www.google.com/s2/favicons?domain=" + domain);
    return res.json(img);
})

// Add source to user's followlist
app.post('/MrNews/addSource/', function(req,res, err) {
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        let users = db.db('myproject').collection('users');
        if (err) return res.status(500).end(err);
        let username = req.session.username;
        let sourceURL = req.body.article.url;
        let sourceName = req.body.article.name;
        users.findOne({username: username}, function(err, user){
            let followList = user.allFollows;
            for (var i = 0; i < followList.length; i ++) {
                if (followList[i].url == sourceURL) {
                    db.close();
                    return res.status(405).end("Source Already Exists");
                }
            }
            let domain = getDomain(sourceURL);
            let img = ("https://www.google.com/s2/favicons?domain=" + domain);
            let source = new Source(sourceURL, sourceName, 'News Source', img, req.body.article.description);
            users.updateOne({username: username}, {$addToSet: {allFollows: source}}, function(err, user){
                if (err) return res.status(500).end(err);
                db.close();
                serverInstance.sendMsg('current_user', 'news', "You have successfully subscribed to: " + "\n" + sourceName);
                return res.json(source);
            });
        });
    });
});

// Save new user subscribed feed
app.post('/MrNews/follow/', function(req, res, err){
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        let users = db.db('myproject').collection('users');
        let sources = db.db('myproject').collection('sources');
        if (err) return res.status(500).end(err);
        // Get username, given url and feed's name
        let username = req.session.username;
        let feedURL = req.body.url;
        let feedName = req.body.feedName;
        // Save the feed into sources database
        sources.findOne({url: feedURL}, function(err, rss){
            if (err) return res.status(500).end(err);
            if (!rss) {
                let feed = new Source(feedURL, feedName, 'RSS Feed', req.body.img, req.body.des);
                sources.insertOne(feed, function(err, res) {
                    if (err) return status(500).end(err);
                });
                // Update user's database by add new feed into user's allFollows list
                users.updateOne({username: username}, {$addToSet: {allFollows: feed}}, function(err, user) {
                    if (err) return res.status(500).end(err);
                    db.close();
                    serverInstance.sendMsg('current_user', 'news', "You have successfully subscribed to: " + "\n" + feedName);
                    return res.json(feed);
                });
            }
            else {
                users.findOne({username: username}, function(err, user) {
                    // If there already exists same url at user's follow list, then do nothing
                    let allFollows = user.allFollows;
                    for (var i = 0; i < allFollows.length; i ++) {
                        if (allFollows[i].url = feedURL) {
                            db.close();
                            return res.json(rss);
                        }
                    };
                    users.updateOne({username: username}, {$addToSet: {allFollows : rss}}, function(err, user) {
                        if (err) return res.status(500).end(err);
                        db.close();
                        serverInstance.sendMsg('current_user', 'news', "You have successfully subscribed to: " + "\n" + rss.name);
                    });
                    return res.json(rss);
                });
            }
        });
    });
});

// Get user's follow list
app.get('/MrNews/follows/', function(req, res, err){
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true},function(err, db) {
        let users = db.db('myproject').collection('users');
        let sources = db.db('myproject').collection('sources');
        if (err) return res.status(500).end(err);
        // Get current username and return user's follow list
        let username = req.session.username;
        users.findOne({username: username}, function(err, user) {
            if (err) return res.status(500).end(err);
            if (user) {
                let followList = user.allFollows;
                db.close();
                return res.json(followList);
            } else {
                db.close();
                return res.status(500).end("User Not Exists");
            }
        });
    });
});

// Get feed by given url
app.post('/MrNews/getFeed/', function(req, res, err){
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true},function(err, db) {
        let sources = db.db('myproject').collection('sources');
        // Search inside sources database to get feed with given url
        sources.findOne({url: req.body.url}, function(err, data){
            if (err) return res.status(500).end(err);
            db.close();
            return res.json(data);
        });
    });
});

// Create new favorite folder
app.post('/MrNews/addNewFile/', function(req, res, next){
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        if (err) return res.status(500).end(err);
        let users = db.db('myproject').collection('users');
        // Check if there exists duplicate file
        users.findOne({username: req.session.username}, function(err, user) {
            for (var i = 0; i < user.fileList.length; i ++) {
                if (user.fileList[i].filename == req.body.filename) {
                    db.close();
                    return res.status(403).end("File Already Exists");
                }
            }
            users.updateOne({username: req.session.username}, {$addToSet: {fileList: {filename: req.body.filename, followList: []}}}, function(err, item){
                if(err) return res.status(500).end(err);
                db.close();
            });
            return res.json(req.body.filename);
        });
    });
});

// Unsubscribe a feed
app.delete('/MrNews/unfollow/', function(req, res, err){
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        let users = db.db('myproject').collection('users');
        if (err) return res.status(500).end(err);
        let username = req.session.username;
        let feedURL = req.body.url;
        // Delete feed from user's follow list
        users.findOne({username: username}, function(err, user){
            if (err) return res.status(500).end(err);
            let allFollows = user.allFollows;
            for (var i = allFollows.length - 1; i >= 0; i --) {
                if (allFollows[i].url == feedURL) {
                    let rss = allFollows[i];
                    users.updateOne({username: username}, {$pull: {allFollows: rss}}, function(err, res){
                        if (err) console.log(err);
                    });
                }
            };
            // Check user's favorite folder, if feed exists, delete it
            let fileList = user.fileList;
            for (var i = 0; i < fileList.length; i ++) {
                for (var j = 0; j < fileList[i].followList.length; j ++) {
                    if (fileList[i].followList[j].url == feedURL) {
                        let feed =fileList[i].followList[j];
                        users.updateOne({username: username, 'fileList.filename': fileList[i].filename}, {$pull: {'fileList.$.followList': feed}}, function(err, res){
                            if (err) console.log(err);
                        });
                        break;
                    }
                };
            };
            serverInstance.sendMsg('current_user', 'news', "You have successfully unsubscribed to: " + "\n" + feedURL);
            return res.json('');
        });
    });
});

// User add feed to favorite folder
app.post('/MrNews/users/addToFavorite/', function(req, res, err){
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        let users = db.db('myproject').collection('users');
        if (err) return res.status(500).end(err);
        let username = req.session.username;
        users.findOne({username: username}, function(err, user) {
            // If there already exists same url in the given folder, then do nothing
            let fileList = user.fileList;
            for (var i = 0; i < fileList.length; i ++) {
                if (fileList[i].filename == req.body.filename) {
                    for (var j = 0; j < fileList[i].followList.length; j ++) {
                        if (fileList[i].followList[j].url == req.body.rss.url) {
                            db.close();
                            return res.status(403).end('The Feed Already Exists In This Folder');
                        }
                    };
                }
            };
            users.updateOne({username: req.session.username, 'fileList.filename': req.body.filename}, {$push: {'fileList.$.followList': req.body.rss}}, function(err, res){
                if (err) return console.log(err);
                db.close();
            });
        });
    });
    return res.json(req.body.filename);
});

// Get all user's favorite folders
app.get('/MrNews/users/files/', function(req, res, err){
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        let users = db.db('myproject').collection('users');
        let name = req.session.username;
        users.findOne({username: name}, function(err, item){
            if(item){
                db.close();
                return res.json(item.fileList);
            }
        });
    });
});

const http = require('http');
const PORT = 8080;

// Set up socket and server
const httpServer = http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s/", PORT);
});
const PushServer = require('./server');
const serverInstance = new PushServer(httpServer);
