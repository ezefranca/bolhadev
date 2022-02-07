
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


fetch('https://ezefranca.herokuapp.com/bolhadev?ref=RXNzYSBwb3JyYSBuw6RvIGZheiBuYWRhIGhhaGFoYWhh')
.then(res => res.json())
.then(json => {

  var data = []
  var sumAll = 0 // Quando é RT não vai contabilizar os Likes, pq o tweet original que tem os likes. A API retorna Zero. 
  json.forEach(element => {
        sumAll = Number(element.public_metrics.retweet_count) + Number(element.public_metrics.reply_count) + Number(element.public_metrics.like_count) + 1
        data.push({'text' : element.text, 
                   'likes' : `${sumAll}`,
                   // A API não retorna o @funano e sim o ID
                   'author': `https://twitter.com/intent/user?user_id=${element.author_id}`,
                   // Aqui tem uma gambi monsta, foda-se o que vc passa de usuário, o twitter se tiver /status ele ignora
                   'tweet': `https://twitter.com/bolhadev/status/${element.id}`
                 })
  });

  //ordenar por e reverter
  data.sort((a, b) => (Number(a.likes) > Number(b.likes)) ? 1 : -1)
  data.reverse()
  data.forEach(createElementsList)
})

function createElementsList(element, index, array) {
    var tr = document.createElement("tr");
    var table = document.getElementById("ranking_da_bolha");
    tr.innerHTML = createElementInner(index, element.text, element.likes, element.author, element.tweet)
    table.appendChild(tr);
}

function createElementInner(index, text, likes, author, tweet) {
    return `<td data-column="Ranking">${getEmoji(index)}${index + 1}</td>
    <td id="${index}" data-column="Tweet">${detectLinks(text)}</td>
    <td data-column="Likes+RT">${likes}</td>
    <td data-column="Author"><sup><a href="${author}">Autor do Tweet</a></sup></td>
    <td data-column="Link"><sup><a href="${tweet}">Link </a></sup></td>`
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

function detectLinks(val) {
  return anchorme({
    input: val,
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
