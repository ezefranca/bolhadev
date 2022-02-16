
/*

Saudações.

A API basicamente faz um fetch para a API do Twitter Assim, daria pra fazer aqui, mas deixaria o TOKEN exposto, ai joguei no herokuapp pra deixar como env 

function getTweets(req, res) {

        var headers = {
            'Authorization': `Bearer env.TWITTER_BEARER`
        };

        var options = {
            url: 'https://api.twitter.com/2/tweets/search/recent?query=bolhadev&max_results=100&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=created_at',
            headers: headers
        };

        fetch(options.url, { method: 'get', headers: headers })
            .then(r => r.json())
            .then(body => res.json(body.data))
}

*/

let card_html = `<br><div class="card">
<h5 class="card-header"><a href={URL_TWEET}>{RANKING}</a></h5>
<div class="card-body">
<div class="row">
  <div class="col-md-1">
  <br>
  <a href={URL_PROFILE}><img class="shadow" src={IMG_PROFILE} class="img-fluid rounded-start" alt="{NAME}"></a>

    </div>
  <div class="col-md-10">
    <div class="card-body">
      <h5 class="card-text">{NAME} <a href="{URL_PROFILE}">{USERNAME}</a></h5>
      <p class="card-text">{TEXT}</p>
      <p class="card-text"><small class="text-muted"><a href="{URL_TWEET}"> {CREATED_AT}</a></small>
      </p><p class="card-text">{TOTAL_LIKES}</p>
    </div>
  </div>
</div>
</div>
</div>`

var dataRaw = []
var dataRanking = []

function getData() {
    fetch('https://ezefranca.herokuapp.com/bolhadev?ref=RXNzYSBwb3JyYSBuw6RvIGZheiBuYWRhIGhhaGFoYWhh')
    .then(res => res.json())
    .then(json => {

      dataRaw = json
      var sumAll = 0 // Quando é RT não vai contabilizar os Likes, pq o tweet original que tem os likes. A API retorna Zero. 
      json.forEach(element => {
        sumAll = Number(element.tweet.public_metrics.retweet_count) + Number(element.tweet.public_metrics.reply_count) + Number(element.tweet.public_metrics.like_count) + 1
        dataRanking.push({
          'text': element.tweet.text,
          'likes': `${sumAll}`,
          // A API não retorna o @funano e sim o ID
          'author': `https://twitter.com/intent/user?user_id=${element.tweet.author_id}`,
          // Aqui tem uma gambi monsta, foda-se o que vc passa de usuário, o twitter se tiver /status ele ignora
          'tweet': `https://twitter.com/bolhadev/status/${element.tweet.id}`,

          'photo': `${element.user.profile_image_url}`,
          'username': `@${element.user.username}`,
          'name': `${element.user.name}`,
          'user_url': element.user.url,
          'created_at': element.tweet.created_at
        })
      });      
      //ordenar por e reverter
      dataRanking.sort((a, b) => (Number(a.likes) > Number(b.likes)) ? 1 : -1)
      dataRanking.reverse()
      createList(dataRanking, 'ranking')
    })
}

function createList(data, kind) {
  cleanList()
  data.kind = kind
  data.forEach(createElementsList)
}

function createElementsList(element, index, array) {
  createElementInner(index, element, array.kind)
}

// TODO Refactor.
function createElementInner(index, element, kind) {
  switch (kind) {

    case 'ranking':
      var tweetTime = new Date(element.created_at)
      var div = document.createElement('div');
      div.innerHTML = card_html
      div.innerHTML = div.innerHTML
        .replace(/{RANKING}/g, `#Ranking: ${getEmoji(index)}${index + 1}`)
        .replace(/{IMG_PROFILE}/g, element.photo)
        .replace(/{NAME}/g, element.name)
        .replace(/{URL_PROFILE}/g, element.author)
        .replace(/{URL_TWEET}/g, element.tweet)
        .replace(/{USERNAME}/g, element.username)
        .replace(/{TEXT}/g, detectLinks(element.text))
        .replace(/{CREATED_AT}/g,tweetTime.toLocaleDateString('pt-BR') + "," + tweetTime.getHours() + ":" + tweetTime.getMinutes())
        .replace(/{TOTAL_LIKES}/g, `<i class="fa-solid fa-heart"></i> Total Likes + <i class="fa-solid fa-share-from-square"></i> Retweets = <mark><strong> ${element.likes} </strong></mark>`)

      document.getElementById('tweets').appendChild(div);
      return

    case 'timeline':
      tweetTime = new Date(element.tweet.created_at)
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
      options.timeZoneName = 'short';
      var div = document.createElement('div');
      div.innerHTML = card_html
      div.innerHTML = div.innerHTML
        .replace(/{RANKING}/g, "⏱  " + tweetTime.toLocaleDateString('pt-BR', options))
        .replace(/{IMG_PROFILE}/g, element.user.profile_image_url)
        .replace(/{NAME}/g, element.user.name)
        .replace(/{URL_PROFILE}/g, `https://twitter.com/intent/user?user_id=${element.tweet.author_id}`)
        .replace(/{URL_TWEET}/g, `https://twitter.com/bolhadev/status/${element.tweet.id}`)
        .replace(/{USERNAME}/g, "@" + element.user.username)
        .replace(/{TEXT}/g, detectLinks(element.tweet.text))
        .replace(/{CREATED_AT}/g,tweetTime.toLocaleDateString('pt-BR') + ", " + tweetTime.getHours() + "h:" + tweetTime.getMinutes() + "m")
        .replace(/{TOTAL_LIKES}/g,  `<i class="fa-solid fa-heart"></i> Total Likes + <i class="fa-solid fa-share-from-square"></i> Retweets = <mark><strong> ${Number(element.tweet.public_metrics.retweet_count) + Number(element.tweet.public_metrics.reply_count) + Number(element.tweet.public_metrics.like_count) + 1} </strong></mark>`)

      document.getElementById('tweets').appendChild(div);
      return

    default:
      return
  }
}

function getEmoji(index) {

  switch (index) {
    case 0:
      return '🥇'
      break;
    case 1:
      return '🥈'
    case 2:
      return '🥉'
    default:
      return ' '
  }
}

function detectLinks(text) {
  return anchorme({
    input: text,
    options: {
      attributes: (arg) => {
        return {
          class: "detected",
          title: JSON.stringify(anchorme.list(arg))
            .replace(/"/g, "'")
            .replace(/,/g, ",\n"),
        };
      },
    },
  });
}

function cleanList() {
  document.getElementById('tweets').innerHTML = ""
}

window.setInterval(`getData()`, 150000)

window.onload = function () {

  getData()

  document.getElementById('timeline-tab').onclick = function () {
    createList(dataRaw, 'timeline')
  };

  document.getElementById('ranking-tab').onclick = function () {
    createList(dataRanking, 'ranking')
  };
};