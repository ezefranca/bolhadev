
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
var dataRaw = []
var dataRanking = []

function getData() {

fetch('https://ezefranca.herokuapp.com/bolhadev?ref=RXNzYSBwb3JyYSBuw6RvIGZheiBuYWRhIGhhaGFoYWhh')
  .then(res => res.json())
  .then(json => {

    dataRaw = json
    var sumAll = 0 // Quando é RT não vai contabilizar os Likes, pq o tweet original que tem os likes. A API retorna Zero. 
    json.forEach(element => {
      sumAll = Number(element.public_metrics.retweet_count) + Number(element.public_metrics.reply_count) + Number(element.public_metrics.like_count) + 1
      dataRanking.push({
        'text': element.text,
        'likes': `${sumAll}`,
        // A API não retorna o @funano e sim o ID
        'author': `https://twitter.com/intent/user?user_id=${element.author_id}`,
        // Aqui tem uma gambi monsta, foda-se o que vc passa de usuário, o twitter se tiver /status ele ignora
        'tweet': `https://twitter.com/bolhadev/status/${element.id}`
      })
    });

    //ordenar por e reverter
    dataRanking.sort((a, b) => (Number(a.likes) > Number(b.likes)) ? 1 : -1)
    dataRanking.reverse()
    createTable(dataRanking, 'ranking')
  })
}

function createTable(data, kind) {
  cleanTable()
  data.kind = kind
  if (data.kind == 'timeline') { document.getElementById("thead").style.display = 'none' } 
  else { document.getElementById("thead").style.display = '' }
  data.forEach(createElementsList)
}

function createElementsList(element, index, array) {
  var tr = document.createElement("tr");
  var table = document.getElementById("ranking_da_bolha");
  tr.innerHTML = createElementInner(index, element, array.kind)
  table.appendChild(tr);
}

// TODO Refactor.
function createElementInner(index, element, kind) {
  switch (kind) {
    
    case 'ranking':
      
      return `<td data-column="Ranking">${getEmoji(index)}${index + 1}</td>
      <td id="${index}" data-column="Tweet">${detectLinks(element.text)}</td>
      <td data-column="Likes+RT">${element.likes}</td>
      <td data-column="Author"><sup><a href="${element.author}">Autor</a></sup></td>
      <td data-column="Link"><sup><a href="${element.tweet}">Link </a></sup></td>`

    case 'timeline':
      let tweetTime = new Date(element.created_at).toString();
      return `<td data-column="Ranking"></td>
      <td id="${index}" data-column="Tweet">${detectLinks(element.text)}</td>
      <td data-column="Hora"><small>${tweetTime}<small></td>
      <td data-column="Author"><sup><a href="${`https://twitter.com/intent/user?user_id=${element.author_id}`}">Autor</a></sup></td>
      <td data-column="Link"><sup><a href="${`https://twitter.com/bolhadev/status/${element.id}`}">Link </a></sup></td>`

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
      return ''
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

function cleanTable() {
  var body = document.querySelector('tbody');
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }
}

window.setInterval(`getData()`, 150000)

window.onload = function () {

  getData()

  document.getElementById('timeline-tab').onclick = function () {
    createTable(dataRaw, 'timeline')
  };

  document.getElementById('ranking-tab').onclick = function () {
    createTable(dataRanking, 'ranking')
  };
};



