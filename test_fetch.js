const fs = require('fs');
async function run() {
  const res = await fetch("https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt");
  if (!res.ok) {
    console.log("ERR GET HTTP", res.status);
    return;
  }
  const text = await res.text();
  console.log("SUCCESS HTTP", text.length, "bytes");
  console.log(text.substring(0, 100));
}
run();
