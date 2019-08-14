async function fetchHtmlAsText(url) {
    return await (await fetch(url)).text();
}
async function loadNav() {
    const contentDiv = document.getElementById("nav");
    contentDiv.innerHTML = await fetchHtmlAsText("nav.html");
}
async function loadFooter() {
    const contentDiv = document.getElementById("footer");
    contentDiv.innerHTML = await fetchHtmlAsText("footer.html");
}

function extractHostname(url) {
    if (!validURL(url))
      return url;
    var pathArray = url.split( '/' );
    var protocol = pathArray[0];
    var host = pathArray[2];
    return protocol + '//' + host;
}
function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
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
function txHashInUrl(url) {
  return url.includes('{tx_hash}')
}
