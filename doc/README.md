# Mr News Rss reader REST API Documentation

## User

### Create

- description: create a new User and store it in database 
- request: `POST /MrNews/signup/`
    - content-type: `application/json`
    - body: object
        - username: (string) the username of the user
        - password: (string) the password of the user
        - email: (string) the email of the user
        - file: (file) the upload file image of user avatar
- response: 200
- response: 500
- response: 409
    - body: username already exists
            Email has already been used.
``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"username":"username","email":"mrnewswebsite@gmail.com", "password":"psd", "file":file} 
       http://mrnews.azurewebsites.net/MrNews/signup/'
```


- description: login to create a new session
- request: `POST /MrNews/login/` 
    - content-type: `application/json`
    - body: object
        - username: (string) the username of the user
        - password: (string) the password of the user
- response: 200
- response: 500
    - body: Already sign in, please log out first!
- response: 401
    - body: Access Denied: User Does Not Exists. 
            Access Denied: Password Not Correct.
``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"username":"username", "password":"psd"} 
       http://mrnews.azurewebsites.net/MrNews/login/'
```

- description: save new user subscribed feed
- request: `POST /MrNews/follow/` 
    - content-type: `application/json`
    - body: object
        - username: (string) the username of the user
        - feedURL: (string) the url of the news feed
        - feedName: (string) the name of news feed
- response: 500
- response: 200
    - content-type: `application/json`
    - body: object
        - feedURL: (string) the url of news feed
        - feedName: (string) the name of news feed
        - type: (string) the type of news feed
        - img: (string) the url of feed icon
        - des: (string) the description of news feed
``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"username":"username", "feedURL":"https://rss.cbc.ca/lineup/world.xml", "feedName":"cbc-world"} 
       http://mrnews.azurewebsites.net/MrNews/follow/'
```

- description: create new favorite folder for user
- request: `POST /MrNews/addNewFile/` 
    - content-type: `application/json`
    - body: object
        - username: (string) the username of the user
        - filename: (string) the name of new folder
- response: 403
    - body: File Already Exists.
- response: 200
    - content-type: `application/json`
    - body: object
        - filename: (string) the name of new folder
``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"username":"username", "filename":"test"} 
       http://mrnews.azurewebsites.net/MrNews/addNewFile/'
```

- description: add feed to favorite folder
- request: `POST /MrNews/users/addToFavorite/` 
    - content-type: `application/json`
    - body: object
        - username: (string) the username of the user
        - filename: (string) the name of new folder
        - rss: (object) news feed
- response: 500
- response: 200
    - content-type: `application/json`
    - body: object
        - filename: (string) the name of new folder
``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"username":"username", "filename":"test"} 
       http://mrnews.azurewebsites.net/MrNews/users/addToFavorite/'
```

### Read

- description: verify user email
- request: `GET /verify`
- response: 200
    - content-type: `application/json`
    - body: email is verified
- response: 500
    - body: Bad Request
``` 
$ curl http://mrnews.azurewebsites.net/verify?uid=ffa73e80-7cef-11ea-b3a5-4710b0c843af
``` 


- description: get user's avatar
- request: `GET /MrNews/users/image/`
- response: 200
    - content-type: `profile.mimetype`
    - body: object
        - file: user's image
- response: 404
    - body: Username image does not exists
- response: 500
``` 
$ curl http://mrnews.azurewebsites.net/MrNews/users/image/
``` 

- description: get the profile of user
- request: `GET /MrNews/users/profile/`
- response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the user id
        - username: (string) username of user
        - email: (string) the email of the user
- response: 500
- response: 404
    - body: Username profile does not exists
``` 
$ curl http://mrnews.azurewebsites.net/MrNews/users/profile/
```

- description: sign out
- request: `GET /MrNews/signout/`
- response: 200
``` 
$ curl http://mrnews.azurewebsites.net/MrNews/signout/
```

- description: get user's follow list
- request: `GET /MrNews/follows/`
- response: 200
    - content-type: `application/json`
    - body: object
        - followList: (array) list of all sources user followed
- response: 500
``` 
$ curl http://mrnews.azurewebsites.net/MrNews/follows/
```

- description: get user's all folder
- request: `GET /MrNews/users/files/`
- response: 200
    - content-type: `application/json`
    - body: object
        - fileList: (array) list of all folders user created
``` 
$ curl http://mrnews.azurewebsites.net/MrNews/users/files/
```

### Delete

- description: unsubscribe a feed
- request: `DELETE /MrNews/unfollow/`
    - content-type: `application/json`
    - body: object
        - username: (string) username of user
        - feedURL: (string) the url of news feed
- response: 200
- response: 500
``` 
$ curl -X DELETE
       -H "Content-Type: `application/json`" 
       -d '{"username":"username", "feedURL":"https://rss.cbc.ca/lineup/world.xml"}
       http://mrnews.azurewebsites.net/MrNews/unfollow/
```

## News

### Create

- description: get all news from given url
- request: `POST /MrNews/newsList/`
    - content-type: `application/json`
    - body: object
        - feedurl: (string) the url of news source
- response: 500
- response: 200 
    - content-type: `application/json`
    - body: object
        - feed: (array) array of all news of given RSS url
``` 
$ curl -X POST -H "Content-Type: `application/json`" 
       -d '{"url":"https://rss.cbc.ca/lineup/world.xml"} 
       http://mrnews.azurewebsites.net/MrNews/newsList/'
```

- description: Get given feed's property
- request: `POST /MrNews/newsList/`
    - content-type: `application/json`
    - body: object
        - feedurl: (string) the url of rss
- response: 500
- response: 200 
    - content-type: `application/json`
    - body: object
        - title: (string) title of rss
        - description: (string) description of rss
        - image.url: (string) url of rss icon
``` 
$ curl -X POST -H "Content-Type: `application/json`" 
       -d '{"url":"https://rss.cbc.ca/lineup/world.xml"} 
       http://mrnews.azurewebsites.net/MrNews/newsList/'
```

- description: get feed from url
- request: `POST /MrNews/getFeed/`
    - content-type: `application/json`
    - body: object
        - feedurl: (string) the url of rss
- response: 500
- response: 200 
    - content-type: `application/json`
    - body: object
        - data: (object) source with given url
``` 
$ curl -X POST -H "Content-Type: `application/json`" 
       -d '{"url":"https://rss.cbc.ca/lineup/world.xml"} 
       http://mrnews.azurewebsites.net/MrNews/getFeed/'
```

- description: follow a news source
- request: `POST /MrNews/addSource/`
    - content-type: `application/json`
    - body: article
        - name: (string) the name of news source
        - url: (string) the url of news source
- response: 405
    - body: Source already exists.
- response: 200 
    - content-type: `application/json`
    - body: object
        - source: (object) the news source
``` 
$ curl -X POST -H "Content-Type: `application/json`" 
       -d '{"article.name":"abc","article.url":"https://abcnews.go.com"} 
       http://mrnews.azurewebsites.net/MrNews/newsList/'
```

### Read

- description: Get keyword search result
- request: `GET /MrNews/search/everything/:keyword/`
- response: 200
    - content-type: `application/json`
    - body: object
        - status: (string) 'ok' if request was successful or 'error' when request was not successful
        - totalResults: (int) the total number of results 
        - articles: (array) the results of the request
``` 
$ curl http://mrnews.azurewebsites.net/MrNews/search/everything/:keyword/
```

- description: Get all sources
- request: `GET /MrNews/search/source/`
- response: 200
    - content-type: `application/json`
    - body: object
        - status: (string) 'ok' if request was successful or 'error' when request was not successful
        - sources: (array) the results of the request
``` 
$ curl http://mrnews.azurewebsites.net/MrNews/search/source/
```

- description: Get topline news
- request: `GET /MrNews/search/topline/`
- response: 200
    - content-type: `application/json`
    - body: object
        - status: (string) 'ok' if request was successful or 'error' when request was not successful
        - totalResults: (int) the total number of results 
        - articles: (array) the results of the request
``` 
$ curl http://mrnews.azurewebsites.net/MrNews/search/topline/
```

- description: Get all sources in cetegory
- request: `GET /MrNews/search/source/:category/`
- response: 200
    - content-type: `application/json`
    - body: object
        - status: (string) 'ok' if request was successful or 'error' when request was not successful
        - sources: (array) the results of the request
``` 
$ curl http://mrnews.azurewebsites.net/MrNews/search/source/:category/
```
