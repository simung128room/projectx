const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9229/json/list', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const targets = JSON.parse(data);
    const target = targets[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    
    ws.on('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Debugger.enable' }));
    });
    
    let targetScriptId = null;
    
    ws.on('message', (msg) => {
      const resp = JSON.parse(msg);
      
      if (resp.method === 'Debugger.scriptParsed') {
        const { scriptId, url } = resp.params;
        if (url.includes('server.ts') && !url.includes('node_modules')) {
          targetScriptId = scriptId;
          // Request source
          ws.send(JSON.stringify({
            id: 2,
            method: 'Debugger.getScriptSource',
            params: { scriptId: targetScriptId }
          }));
        }
      }
      
      if (resp.id === 2 && resp.result && resp.result.scriptSource) {
        require('fs').writeFileSync('server.ts.recovered', resp.result.scriptSource);
        console.log('RECOVERED successfully to server.ts.recovered');
        process.exit(0);
      }
    });

  });
});
