window.rankingPeriod = 30 * 24 * 60 * 60 // 30 days
window.directoryPeriod = 180 * 24 * 60 * 60 // 180 days
window.bitcomAddress = "149xadSKJcKdhgE4sMmcvx421nsGYwgkWo"
// neongenesis planaria node
window.neongenesisNodeDefault = 'https://neongenesis.bitdb.network/q/1HcBPzWoKDL2FhCMbocQmLuFTYsiD73u1j/'
window.neongenesisNode = window.neongenesisNodeDefault
if (localStorage.getItem('neongenesisNode')) {
  if (window.neongenesisNodeDefault === localStorage.getItem('neongenesisNode'))
  {
    localStorage.removeItem('neongenesisNode')
  } else {
    window.neongenesisNode = localStorage.getItem('neongenesisNode')
  }
}
// bitdb api key
window.bitdbApiKeyDefault = 'qpl84tsdqd6yxd3hpxhj5ngr3rp0pvlweqy7p7rzfy'
window.bitdbApiKey = window.bitdbApiKeyDefault
if (localStorage.getItem('bitdbApiKey')) {
  if (window.bitdbApiKeyDefault === localStorage.getItem('bitdbApiKey'))
  {
    localStorage.removeItem('bitdbApiKey')
  } else {
    window.bitdbApiKey = localStorage.getItem('bitdbApiKey')
  }
}

async function fetchHtmlAsText(url) {
    return await (await fetch(url)).text();
}
async function loadNav() {
    const contentDiv = document.getElementById("nav");
    if (contentDiv !== null) {
      contentDiv.innerHTML = await fetchHtmlAsText("/includes/nav.html");
    }
}
async function loadFooter() {
    const contentDiv = document.getElementById("footer");
    if (contentDiv !== null) {
      contentDiv.innerHTML = await fetchHtmlAsText("/includes/footer.html");
    }
}
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}
function extractHostname(url) {
    if (!validURL(dummyTxUrl(url)))
      return url;
    var pathArray = url.split( '/' );
    var protocol = pathArray[0];
    var host = pathArray[2];
    host = host.split( '?' )[0];
    return protocol + '//' + host;
}
function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~\{\}+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}
function correctTxUrl(url) {
  return url.replace(/[0-9a-fA-F]{64}/, '{tx_hash}')
}
function dummyTxUrl(url) {
  return url.replace("{tx_hash}", "000000000000000000000000000000000000000000000000000000000000")
}
function txHashInUrl(url) {
  return url.includes('{tx_hash}')
}
function renderMoneybutton(address, amount, type, appName, appUrl, elementId) {
  var disabled = false
  var label = "Bid"
  if (appUrl === "") {
    label = "Enter URL"
    disabled = true
  } else if (!validURL(dummyTxUrl(appUrl))) {
    label = "Invalid URL"
    disabled = true
  } else if (!txHashInUrl(appUrl)) {
    label = "{tx_hash} is missing"
    disabled = true
  } else if (type !== "default" && appName === "") {
    label = "Enter app name"
    disabled = true
  }
  var opReturnScript = bsv.Script.buildDataOut([address, type, appName, appUrl]).toASM()

  const moneybuttonDiv = document.getElementById(elementId)
  moneyButton.render(moneybuttonDiv, {
    label: label,
    disabled: disabled,
    outputs: [
    {
      type: 'tip',
      to: address,
      currency: "USD",
      amount: amount
    }, {
      type: 'SCRIPT',
      script: opReturnScript,
      amount: '0',
      currency: 'BSV'
    }]
  })
}
var getTypeRankings = function(address, type, beginTimestamp, endTimestamp) {
  return new Promise(function(resolve, reject) {
    var query = getOyoProListByType(address, type, beginTimestamp, endTimestamp);
    var b64 = btoa(JSON.stringify(query, null, 2));

    var url = window.neongenesisNode + b64;
    var header = { headers: { key: window.bitdbApiKey } };
    fetch(url, header).then(function(res) {
      return res.json()
    }).then(function(res) {
        if (res.c !== undefined || res.u !== undefined) {
          let items = []
          if (res.c !== undefined) {
            items = items.concat(res.c)
          }
          if (res.u !== undefined) {
            for (let i = 0; i < res.u.length; ++i) {
              let added = 0
              for (let j = 0; j < items.length; ++j) {
                if (JSON.stringify(res.u[i]._id) === JSON.stringify(items[j]._id)) {
                  items[j].satoshis += res.u[i].satoshis
                  added = 1
                }
              }
              if (added === 0) {
                items = items.concat(res.u[i])
                added = 1
              }
            }
          }
          resolve(items)
        }
    })
    .catch(error => {
      reject(error)
      console.log(error)
    })
  })
}
var getRankings = function(address, type, appName, appUrl, beginTimestamp, endTimestamp) {
  return new Promise(function(resolve, reject) {
    if (type !== "default" && appName === "") {
      return
    }

    var query = getOyoProAggregatedQuery(address, type, appName, appUrl, beginTimestamp, endTimestamp);
    var b64 = btoa(JSON.stringify(query, null, 2));

    var url = window.neongenesisNode + b64;
    var header = { headers: { key: window.bitdbApiKey } };
    fetch(url, header).then(function(res) {
      return res.json()
    }).then(function(res) {
        if (res.c !== undefined || res.u !== undefined) {
          let items = []
          if (res.c !== undefined) {
            items = items.concat(res.c)
          }
          if (res.u !== undefined) {
            for (let i = 0; i < res.u.length; ++i) {
              let added = 0
              for (let j = 0; j < items.length; ++j) {
                if (JSON.stringify(res.u[i]._id) === JSON.stringify(items[j]._id)) {
                  items[j].satoshis += res.u[i].satoshis
                  added = 1
                }
              }
              if (added === 0) {
                items = items.concat(res.u[i])
                added = 1
              }
            }
          }
          resolve(items)
        }
    })
    .catch(error => {
      reject(error)
      console.log(error)
    })
  })
}
var renderRankingNames = function(type, arrayObjects, elementId) {
  var len = arrayObjects.length;
  var text = "";

  text += "<table class=\"table is-narrow is-hoverable\">";
  for (var i = 0; i < len; i++) {
      var myObject = arrayObjects[i];
      text += "<tr>";
      text += "<td class=\"idColomn\">" + (i + 1) + "</td>";
      text += "<th class=\"amountColomn\">" + myObject.satoshis + "</th>"
      // hostname only
      text += "<td><a href=\"javascript:void(0)\" onclick=\"changeApp('" + myObject._id.name[0] + "')\">"
      text += myObject._id.name[0]
      text += "</a></td>";
      text += "</tr>";
  }
  text += "</table>";
  document.getElementById(elementId).innerHTML = text
}
var renderRankingUrls = function(type, arrayObjects, elementId) {
  var len = arrayObjects.length;
  var text = "";

  text += "<table class=\"table is-narrow is-hoverable\">";
  for (var i = 0; i < len; i++) {
      var myObject = arrayObjects[i];
      text += "<tr>";
      text += "<td class=\"idColomn\">" + (i + 1) + "</td>";
      text += "<th class=\"amountColomn\">" + myObject.satoshis + "</b></th>";
      // hostname only
      text += "<td><a href=\"" + extractHostname(myObject._id.url[0]) + "\">";
      text += extractHostname(myObject._id.url[0]);
      text += "</a></td>";
      text += "<td><a class=\"button\" href=\"/add/?type=" + type + "&appName=" + myObject._id.name[0] + "&appUrl=" + myObject._id.url[0] + "\">";
      text += "Boost ranking";
      text += "</a></td>";
      text += "</tr>";
  }
  text += "</table>";
  document.getElementById(elementId).innerHTML = text
}
