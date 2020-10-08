(function(){
    "use strict";
    window.onload = function(){
        let item = api.getNews();
        console.log(item);

        // Display news if news is searched by newsapi
        if(item.type === "google"){
            document.getElementById('news_title').innerHTML = '';
            document.getElementById('news_title').innerHTML = `
                <h1 class="col-md text-light text-center"> ${item.news.title} </h1>
                <div class="w-100"></div>
                <h5 class="col-md-auto text-light text-center news_separate"> Published at: ${item.news.publishedAt} </h5>
                <div class="w-100"></div>
                <h5 class="col-md-auto text-light text-center"> Author: ${item.news.author} </h5>
            `;

            document.getElementById('news_content').innerHTML = '';
            document.getElementById('news_content').innerHTML = `
                <img class="col-md img-fluid" src="${item.news.urlToImage}"/>
                <div class="w-100"></div>
                <div class="col text-light top_buffer"> ${item.news.content} </div>
            `;

            let elmt = document.createElement('button');
            elmt.className="btn btn-outline-info btn-rounded btn-sm ml-auto p-2";
            elmt.id = "read_more";
            elmt.innerHTML=`Read More`;
            document.getElementById('news_foot').append(elmt);
            document.getElementById("read_more").addEventListener('click', function(e){
                e.preventDefault();
                window.open(item.news.url);
            });
        }

        // Display news if news is searched by feed fetch
        else {
            document.getElementById('news_title').innerHTML = '';
            document.getElementById('news_title').innerHTML = `
                <h1 class="col-md display-5 text-light text-center"> ${item.news.title} </h1>
                <div class="w-100"></div>
                <h5 class="col-md-auto text-light text-center"> Published at: ${item.news.pubDate} </h5>
                <div class="w-100"></div>
                <h5 class="col-md-auto text-light text-center"> Author: ${item.news.creator} </h5>
            `;

            let image = item.news.content.match(/<img src=(\S*)/)[1];
            console.log(image);
            document.getElementById('news_content').innerHTML = '';
            document.getElementById('news_content').innerHTML = `
                <img class="col-md img-fluid" src=${image}/>
                <div class="w-100"></div>
                <div class="col text-light top_buffer">${item.news.contentSnippet}</div>
            `;

            let elmt = document.createElement('button');
            elmt.className="btn btn-outline-info btn-rounded btn-sm ml-auto p-2";
            elmt.id = "read_more";
            elmt.innerHTML=`Read More`;
            document.getElementById('news_foot').append(elmt);
            document.getElementById("read_more").addEventListener('click', function(e){
                e.preventDefault();
                window.open(item.news.link);
            });
        }
    }
}());