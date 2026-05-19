const fetch = require("node-fetch");
async function go() {
    const res = await fetch("https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt");
    console.log(res.status);
    const text = await res.text();
    console.log(text.substring(0, 50));
}
go();
