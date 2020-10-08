/*jshint esversion: 6 */
let api = (function(){
    "use strict";

    let module = {};

    function send(method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText))
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    if (!localStorage.getItem('news')){
        localStorage.setItem('news', JSON.stringify({items: [], type: 'none'}));
    }

    // Start application with socket.io
    module.start = function() {
        send("POST", "/start/", function(err, res){
            if (err) return notifyErrorListeners(err);
        });
    }

    // Tracking user profile
    module.onUserImageProfile = function(handler){
        api.getUserProfile(function(err, profile){
            if (err) return notifyErrorListeners(err);
            usersListeners.push(handler);
            handler(profile);
        });
    }

    // Get user profile
    module.getUserProfile = function(callback){
        send("GET", "/MrNews/users/profile/", null, callback);
    }

    // Get username from cookie
    module.getUsername = function(){
        return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    }

    // Error listeners
    let errorListeners = [];

    function notifyErrorListeners(err){
        errorListeners.forEach(function(listener){
            listener(err);
        });
    }

    // Tracking error
    module.onError = function(listener){
        errorListeners.push(listener);
    };

    // Get image icon of given source
    module.getImg = function(url, callback) {
        send("POST", "/getImg/", {url: url}, function(err, res){
            if (err) return notifyErrorListeners(err);
            callback(res);
        });
    }

    // Search news by keyword
    module.searchNews = function(keyword, callback){
        send("GET", "/MrNews/search/everything/"+ keyword + "/", null, function(err, res){
            if (err) return notifyErrorListeners(err);
            callback(res);
        });
    }

    // Search news sources
    module.searchSource = function(callback){
        send("GET", "/MrNews/search/source/", null, function(err, res){
            if (err) return notifyErrorListeners(err);
            callback(res);
        });
    }

    // Get top news
    module.getTopline = function(callback){
        send("GET", "/MrNews/search/topline/", null, function(err, res){
            if (err) return notifyErrorListeners(err);
            callback(res);
        });
    }

    // Search news source by given category
    module.searchCategory = function(category, callback){
        send("GET", "/MrNews/search/source/" + category + "/", null, function(err, res){
            if (err) return notifyErrorListeners(err);
            callback(res);
        });
    }

    // Add feed to user's followlist
    module.addFollow = function (url) {
        send("POST", "/MrNews/getProp/", {url: url}, function(err, res){
            if (err) return notifyErrorListeners(err);
            send("POST", "/MrNews/follow/", {url: url, feedName: res.title, img: res.img, des: res.description}, function(err, res){
                if (err) return notifyErrorListeners(err);
                notifyFollowsListeners();
            });
        });
    };

    // Add news source to user's followlist
    module.addSource = function(article) {
        send("POST", "/MrNews/addSource/", {article: article}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyFollowsListeners();
        });
    };

    // Get all news of given source
    module.getAllnews = function (source, callback) {
        send("POST", "/MrNews/newsList/", {source: source}, function(err, res) {
            if (err) return notifyErrorListeners(err);
            callback(res);
        });
    };

    // Get feed by given url
    module.getFeed = function (url) {
        send("POST", "/MrNews/getFeed/", {url: url}, function (err, res){
            if (err) return notifyErrorListeners(err);
            return res;
        });
    };

    // Add news source to user's favorite folder
    module.addToFavorite = function(filename, rss){
        send("POST", "/MrNews/users/addToFavorite/", {filename: filename, rss: rss},function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyUserFileUpdate();
        });
    }

    // Unfollow a rss feed
    module.unfollowRss = function(rss, url){
        send("DELETE", "/MrNews/unfollow/", {url: url},function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyFollowsListeners();
            notifyUserFileUpdate();
        });
    }

    // Add new user's favorite folder
    module.addNewFile = function(filename){
        send("POST", "/MrNews/addNewFile/", {filename: filename}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyUserFileUpdate();
        });
    }

    // Store current news in localhost
    module.storeNews = function(news, type) {
        let newslist = JSON.parse(localStorage.getItem('news'));
        newslist.items.push(news);
        newslist.type = type;
        localStorage.setItem('news', JSON.stringify(newslist));
    }

    // Get news in localhost
    module.getNews = function(){
        let newslist = JSON.parse(localStorage.getItem('news'));
        let news = newslist.items[0];
        let type = newslist.type;
        newslist.items = [];
        newslist.type = '';
        localStorage.setItem('news', JSON.stringify(newslist));
        return {news, type};
    }

    // Return followlist of user
    let getUserFollows = function(callback) {
        send("GET", "/MrNews/follows/", null, callback);
    };

    // Return favorite folders of user
    let getUserFiles = function(callback){
        send("GET", "/MrNews/users/files/", null, callback);
    }

    // Follow listener
    let followListeners = [];

    function notifyFollowsListeners(){
        getUserFollows(function(err, res){
            if (err) return notifyErrorListeners(err);
            followListeners.forEach(function(listener){
                listener(res);
            });
        });
    }

    // Tracking user's followlist
    module.onFollowsUpdate = function(listener){
        followListeners.push(listener);
        getUserFollows(function(err, res){
            if (err) return notifyErrorListeners(err);
            listener(res);
        });
    };

    // Folder listener
    let fileListeners = [];

    function notifyUserFileUpdate(){
        getUserFiles(function(err, res){
            if (err) return notifyErrorListeners(err);
            fileListeners.forEach(function(listener){
                listener(res);
            });
        });
    }

    // Tracking user favorite folder
    module.onUserFileUpdate = function(listener){
        fileListeners.push(listener);
        getUserFiles(function(err, res){
            if(err) return notifyErrorListeners(err);
            listener(res);
        });
    };

    return module;
})();