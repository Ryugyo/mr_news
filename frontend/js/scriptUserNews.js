(function(){
    "use strict";
    window.onload = function(){
        let thisRss = this.undefined;
        let choice = this.undefined;

        // Get socket.io turned on
        api.start();

        // Function use to display top news
        let display_topNews = function(res) {
            let items = res.articles;
            document.getElementById("searchColumn").innerHTML = '';
            document.getElementById('newsColumn').innerHTML = '';
            document.getElementById('column_title').innerHTML = '';
            document.getElementById('column_title').innerHTML = `
                <h1 class="h3 top_buffer col-md-auto mb-3 font-weight-normal text-light animated bounceInRight"> Top News </h1>
            `;
            items.forEach(function(item){
                if(item){
                    let image = item.urlToImage;
                    if (item.urlToImage == null) {
                        image = '../media/question.png';
                    }
                    let title = document.createElement('div');
                    title.className = "col";
                    title.innerHTML = `
                        <h1 class="col-md-auto display-3">Top News</h1>
                    `;
                    let elmt = document.createElement('div');
                    elmt.className = "card text-white bg-dark border-primary top_buffer col-12 animated bounceInRight";
                    elmt.innerHTML =`
                        <div class="card-header bg-transparent border-white">
                            <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-body row">
                            <div class="col-2"> <img style="max-height: 100px; max-width: 100px" src=${image}> </div>
                            <div class="col-9 row">
                                <p class="card-text col">${item.description}</p>
                                <div class="w-100"></div>
                                <p class="card-text col">Author: ${item.author}</p>
                                <div class="w-100"></div>
                                <p class="card-text col">Date: ${item.publishedAt}</p>
                            </div>
                            </div>
                            <div class="card-footer bg-transparent border-white">
                                <button type="submit" class="btn btn-primary" id="topnewsReadButton">Read News</button>
                        </div>
                    `;
                    document.getElementById("newsColumn").prepend(elmt);
                    document.getElementById("topnewsReadButton").addEventListener('click', function(e){
                        e.preventDefault();
                        api.storeNews(item, 'google');
                        window.location.replace("/displayNews.html");
                    });
                }
            });
        };

        // Function use to display all news of current RSS feed
        let display_Feednews = function(res) {
            let items = res.items;
            console.log(items);
            document.getElementById("searchColumn").innerHTML = '';
            document.getElementById('newsColumn').innerHTML = '';
            document.getElementById('column_title').innerHTML = '';
            document.getElementById('column_title').innerHTML = `
                <h1 class="h3 top_buffer col-md-auto mb-3 font-weight-normal text-light animated bounceInRight"> News List </h1>
            `;
            items.forEach(function(item){
                if(item){
                    let elmt = document.createElement('div');
                    elmt.className = "card text-white bg-dark border-primary top_buffer col-12 animated bounceInRight";
                    elmt.innerHTML =`
                        <div class="card-header bg-transparent border-white">
                            <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-body row">
                        <div class="col-9 row">
                        <p class="card-text col">Creator: ${item.creator}</p>
                        <p class="card-text col">${item.content}</p>
                        <div class="w-100"></div>
                        <p class="card-text col">Author: ${item.author}</p>
                        <div class="w-100"></div>
                        <p class="card-text col">Date: ${item.pubDate}</p>
                        </div>
                        </div>
                        <div class="card-footer bg-transparent border-white">
                                <button type="submit" class="btn btn-primary" id="feednewsReadButton">Read News</button>
                        </div>
                    `;
                    document.getElementById("newsColumn").prepend(elmt);
                    document.getElementById("feednewsReadButton").addEventListener('click', function(e){
                        e.preventDefault();
                        api.storeNews(item, 'feed');
                        window.location.replace("/displayNews.html");
                    });
                }
            });
        };

        // Function use to display source search news
        let display_sourceNews = function(res){
            let articles = res;
            document.getElementById("newsColumn").innerHTML = '';
            document.getElementById('column_title').innerHTML = '';
            document.getElementById('column_title').innerHTML = `
                <h1 class="h3 top_buffer col-md-auto mb-3 font-weight-normal text-light animated bounceInRight"> News Sources </h1>
            `;
            articles.forEach(function(article){
                if(article){
                    let elmt = document.createElement('div');
                    api.getImg(article.url, function(img){
                        elmt.className = "card text-white bg-dark border-primary top_buffer col-12 animated bounceInRight";
                        elmt.innerHTML =`
                            <div class="card-header bg-transparent border-white">
                                <h5 class="card-title">${article.name}</h5>
                            </div>
                            <div class="card-body row">
                                <div class="col-2"><img style="max-height: 100px; max-width: 100px" width="100" height="100" src=${img}></div>
                                <div class="col-9 row">
                                    <p class="card-text col">Source Country: ${article.country}</p>
                                    <div class="w-100"></div>
                                    <p class="card-text col">${article.description}</p>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent border-white">
                                <button type="submit" class="btn btn-primary" id="followButton">Follow This Source</button>
                                <a href="${article.url}" target="_blank" rel="noopener">To The Link</a>
                            </div>
                        `;
                        document.getElementById("newsColumn").prepend(elmt);
                        document.getElementById("followButton").addEventListener('click', function(e){
                            e.preventDefault();
                            api.addSource(article);
                        });
                    });
                }
            });
        };

        // Function use to display keyword search news
        let display_keywordNews = function(res){
            let articles = res.articles;
            document.getElementById("newsColumn").innerHTML = '';
            document.getElementById('column_title').innerHTML = '';
            document.getElementById('column_title').innerHTML = `
                <h1 class="h3 top_buffer col-md-auto mb-3 font-weight-normal text-light animated bounceInRight"> News List </h1>
            `;
            articles.forEach(function(article){
                if(article){
                    let img = article.urlToImage;
                    if (img == null) {
                        img = '../media/question.png';
                    }
                    let elmt = document.createElement('div');
                    elmt.className = "card text-white bg-dark border-primary top_buffer col-12 animated bounceInRight";
                    elmt.innerHTML =`
                        <div class="card-header bg-transparent border-white">
                            <h5 class="card-title">${article.title}</h5>
                        </div>
                        <div class="card-body row">
                            <div class="col-4"> <img style="max-height: 200px; max-width: 200px" src="${img}"> </div>
                            <div class="col-6 row">
                                <p class="card-text col">${article.description}</p>
                                <div class="w-100"></div>
                                <p class="card-text col">Author: ${article.author}</p>
                                <div class="w-100"></div>
                                <p class="card-text col">Date: ${article.publishedAt}</p>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-white">
                            <button type="submit" class="btn btn-primary" id="keynewsReadButton">Read News</button>
                            <a href="${article.url}" target="_blank" rel="noopener">To The Link</a>
                        </div>
                    `;
                    document.getElementById("newsColumn").prepend(elmt);
                    document.getElementById("keynewsReadButton").addEventListener('click', function(e){
                        e.preventDefault();
                        api.storeNews(article, 'google');
                        window.location.replace("/displayNews.html");
                    });
                }
            });
        };

        // Load top news for user when app start
        api.getTopline(display_topNews);

        // Click top news button, return top news
        document.getElementById("top_news_button").addEventListener('click', function(e){
            e.preventDefault();
            api.getTopline(display_topNews);
        });

        // Get User Profile
        api.getUserProfile(function(err, item){
            if(err) return console.log(err);
            document.getElementById("user_profile_area").innerHTML = '';
            let elmt = document.createElement('div');
            elmt.innerHTML=`
                <img class="user_image" src="/MrNews/users/image/" alt="/MrNews/users/image/"/>
                <div class="title text-white text-center font-weight-bold"> ${item.username} </div>
            `;
            document.getElementById("user_profile_area").prepend(elmt);
        });

        // Click follow rss button, follow given rss
        document.getElementById("follow_rss_button").addEventListener('click', function(e){
            e.preventDefault();
            document.getElementById('newsColumn').innerHTML = '';
            document.getElementById("searchColumn").innerHTML = '';
            document.getElementById('column_title').innerHTML = '';
            let elmt = document.createElement('div');
            elmt.className = "col-12 animated bounceInRight";
            elmt.innerHTML=`
                <form class="form-row" id="URLForm">
                    <div class="col-10">
                        <input type="text" class="form-control" placeholder="Enter a RSS url" id="followURL">
                    </div>
                    <div class="col">
                        <button class="btn btn-outline-info btn-rounded btn-sm my-0" type="submit" id="subscribe_button">Subscribe</button>
                    </div>
                </form>
            `;
            document.getElementById("searchColumn").prepend(elmt);
            document.getElementById("subscribe_button").addEventListener('click', function(e){
                e.preventDefault();
                let url = document.getElementById("followURL").value;
                document.getElementById("URLForm").reset();
                api.addFollow(url);
            });
        });

        // Click source search button, return all recommended sources
        document.getElementById("source_search").addEventListener('click', function(e){
            e.preventDefault();
            document.getElementById("searchColumn").innerHTML = '';
            api.searchSource(display_sourceNews);
        });

        // Click category search button
        document.getElementById("category_search").addEventListener('click', function(e){
            e.preventDefault();
            document.getElementById('newsColumn').innerHTML = '';
            document.getElementById("searchColumn").innerHTML = '';
            document.getElementById('column_title').innerHTML = '';
            document.getElementById("searchColumn").innerHTML=`
            <div class="btn-group col-12 animated bounceInRight" role="group">
                <button class="btn btn-secondary" type="submit" id="categoryBusiness">business</button>
                <button class="btn btn-secondary" type="submit" id="categoryEntertainment">entertainment</button>
                <button class="btn btn-secondary" type="submit" id="categoryGeneral">general</button>
                <button class="btn btn-secondary" type="submit" id="categoryHealth">health</button>
                <button class="btn btn-secondary" type="submit" id="categoryScience">science</button>
                <button class="btn btn-secondary" type="submit" id="categorySports">sports</button>
                <button class="btn btn-secondary" type="submit" id="categoryTechnology">technology</button>
            </div>
            `;
            // Return business news source
            document.getElementById("categoryBusiness").addEventListener('click', function(e){
                e.preventDefault();
                api.searchCategory("business", display_sourceNews);
            });
            // Return entertainment news source
            document.getElementById("categoryEntertainment").addEventListener('click', function(e){
                e.preventDefault();
                api.searchCategory("entertainment", display_sourceNews);
            });
            // Return general news source
            document.getElementById("categoryGeneral").addEventListener('click', function(e){
                e.preventDefault();
                api.searchCategory("general", display_sourceNews);
            });
            // Return health news source
            document.getElementById("categoryHealth").addEventListener('click', function(e){
                e.preventDefault();
                api.searchCategory("health", display_sourceNews);
            });
            // Return science news source
            document.getElementById("categoryScience").addEventListener('click', function(e){
                e.preventDefault();
                api.searchCategory("science", display_sourceNews);
            });
            // Return sports news source
            document.getElementById("categorySports").addEventListener('click', function(e){
                e.preventDefault();
                api.searchCategory("sports", display_sourceNews);
            });
            // Return technology news source
            document.getElementById("categoryTechnology").addEventListener('click', function(e){
                e.preventDefault();
                api.searchCategory("technology", display_sourceNews);
            });
        });

        // Click keyword search button, return all news related to keyword
        document.getElementById("keyword_search").addEventListener('click', function(e){
            e.preventDefault();
            document.getElementById('newsColumn').innerHTML = '';
            document.getElementById("searchColumn").innerHTML = '';
            document.getElementById('column_title').innerHTML = '';
            let elmt = document.createElement('div');
            elmt.className = "col-12 animated bounceInRight";
            elmt.innerHTML=`
                <form id="search_form">
                    <div class="form-row">
                        <div class="col-9">
                            <input type="text" class="form-control" placeholder="Enter your keyword" id="keywordSearch" required/>
                        </div>
                        <div class="col">
                            <button class="btn btn-outline-info btn-rounded btn-sm my-0" type="submit" id="sourceSearchButton">Search</button>
                        </div>
                    </div>
                </form>
            `;
            document.getElementById("searchColumn").prepend(elmt);
            document.getElementById("sourceSearchButton").addEventListener('click', function(e){
                e.preventDefault();
                let searchContent = document.getElementById("keywordSearch").value;
                document.getElementById("search_form").reset();
                api.searchNews(searchContent, display_keywordNews);
            });
        });

        // Click save file button, save user's favorite folder
        document.getElementById("save_new_file").addEventListener('click', function(e){
            e.preventDefault();
            let newFileName = document.getElementById('new_file_name').value;
            api.addNewFile(newFileName);
        });

        // Click show rss button, return all user's followed feeds
        document.getElementById("show_rss_button").addEventListener('click', function(e){
            e.preventDefault();
            document.getElementById("searchColumn").innerHTML = '';
            document.getElementById('newsColumn').innerHTML = '';
            document.getElementById('column_title').innerHTML = '';
            api.onFollowsUpdate(function(items){
                document.getElementById("searchColumn").innerHTML = '';
                document.getElementById('column_title').innerHTML = '';
                document.getElementById('column_title').innerHTML = `
                    <h1 class="h3 top_buffer col-md-auto mb-3 font-weight-normal text-light animated bounceInRight"> My Feeds </h1>
                `;
                document.getElementById('newsColumn').innerHTML = '';
                items.forEach(function(item){
                    if(item){
                        let img = item.img;
                        if (img == null) {
                            img = '../media/question.png';
                        }
                        let elmt = document.createElement('div');
                        elmt.className = "card text-white bg-dark border-primary top_buffer col-12 animated bounceInRight";
                        elmt.innerHTML =`
                            <div class="card-header bg-transparent border-white">
                                <h5 class="card-title">${item.name}</h5>
                            </div>
                            <div class="card-body row">
                                <div class="col-2"> <img style="max-height: 100px; max-width: 100px" width="100" height="100" src=${img}> </div>
                                <div class="col-9 row">
                                    <p class="card-text col">${item.des}</p>
                                    <div class="w-100"></div>
                                    <p class="card-text col">Source Type: ${item.type}</p>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent border-white">
                                <button type="submit" class="btn btn-primary" id="newsCheckButton">Check Out News</button>
                                <button type="button" class="btn btn-primary" id="addToButton" data-toggle="modal" data-target="#followModal">Add To</button>
                                <button type="submit" class="btn btn-primary" id="unFollowButton">Unsubscribe</button>
                                <a href="${item.url}" target="_blank" rel="noopener">To The Link</a>
                            </div>
                        `;
                        document.getElementById("newsColumn").prepend(elmt);
                    }
                    document.getElementById("unFollowButton").addEventListener('click', function(e){
                        e.preventDefault();
                        api.unfollowRss(item, item.url);
                    });
                    document.getElementById("newsCheckButton").addEventListener('click', function(e){
                        e.preventDefault();
                        if (item.type == "RSS Feed"){
                            api.getAllnews(item, display_Feednews);
                        }
                        else {
                            api.getAllnews(item, display_keywordNews);
                        }
                    });
                    document.getElementById("addToButton").addEventListener('click', function(e){
                        e.preventDefault();
                        thisRss = item;
                    });
                });
            });
        });

        // Listener track user's folder
        api.onUserFileUpdate(function(items){
            document.getElementById('follow_user_files_area').innerHTML = '';
            items.forEach(function(item){
                let elmt = document.createElement('div');
                elmt.className = "list-group-item d-flex justify-content-between align-items-center";
                elmt.id = item.filename;
                elmt.innerHTML=`
                    ${item.filename}
                    <button class="badge badge-primary" id="to_this_file">Save</button>
                `;
                document.getElementById("follow_user_files_area").prepend(elmt);
                document.getElementById("to_this_file").addEventListener('click', function(e){
                    e.preventDefault();
                    api.addToFavorite(item.filename, thisRss);
                });
            });

            document.getElementById('user_files_area').innerHTML = '';
            items.forEach(function(item){
                let elmt = document.createElement('div');
                elmt.className = "dropdown-item d-flex bd-highlight justify-content-between align-items-center";
                elmt.innerHTML=`
                    <div class="p-2 flex-grow-1 bd-highlight">${item.filename}</div>
                    <button class="badge badge-primary badge-pill" id="show_follow_rss">${item.followList.length}</button>
                `;
                document.getElementById("user_files_area").prepend(elmt);
                document.getElementById("show_follow_rss").addEventListener('click', function(e){
                    document.getElementById("searchColumn").innerHTML = '';
                    document.getElementById('column_title').innerHTML = '';
                    document.getElementById('column_title').innerHTML = `
                        <h1 class="h3 top_buffer col-md-auto mb-3 font-weight-normal text-light animated bounceInRight"> ${item.filename} </h1>
                    `;
                    e.preventDefault();
                    document.getElementById('newsColumn').innerHTML = '';
                    item.followList.forEach(function(eachRss){
                        let img = eachRss.img;
                        if (img == null) {
                            img = '../media/question.png';
                        }
                        elmt = document.createElement('div');
                        elmt.className = "card text-white bg-dark border-primary top_buffer col-12 animated bounceInRight";
                        elmt.innerHTML =`
                            <div class="card-header bg-transparent border-white">
                                <h5 class="card-title">${eachRss.name}</h5>
                            </div>
                            <div class="card-body row">
                                <div class="col-2"> <img style="max-height: 100px; max-width: 100px" width="100" height="100" src=${img}> </div>
                                <div class="col-9 row">
                                    <p class="card-text col">${eachRss.des}</p>
                                    <div class="w-100"></div>
                                    <p class="card-text col">Source Type: ${eachRss.type}</p>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent border-white">
                                <button type="submit" class="btn btn-primary" id="newsCheckButton">Check Out News</button>
                                <button type="button" class="btn btn-primary" id="unfollowButton">Unsubscribe</button>
                                <a href="${eachRss.url}" target="_blank" rel="noopener">To The Link</a>
                            </div>
                        `;
                        document.getElementById("newsColumn").prepend(elmt);
                        document.getElementById("unfollowButton").addEventListener('click', function(e){
                            e.preventDefault();
                            api.unfollowRss(eachRss, eachRss.url);
                        });
                        document.getElementById("newsCheckButton").addEventListener('click', function(e){
                            e.preventDefault();
                            if (eachRss.type == "RSS Feed"){
                                api.getAllnews(eachRss, display_Feednews);
                            }
                            else {
                                api.getAllnews(eachRss, display_keywordNews);
                            }
                        });
                    });
                });
            });
        });
    };
}());