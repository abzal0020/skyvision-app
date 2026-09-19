const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../build');
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.jpeg':'image/jpeg','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf','.mp4':'video/mp4'};
http.createServer((req,res) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname)); } catch { res.writeHead(400); return res.end(); }
  if (!file.startsWith(root + path.sep) && file !== root) {res.writeHead(403);return res.end();}
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (path.extname(file)) {res.writeHead(404);return res.end();}
    file = path.join(root,'index.html');
  }
  const stat=fs.statSync(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':stat.size});
  fs.createReadStream(file).pipe(res);
}).listen(4173,'127.0.0.1',()=>process.stdout.write('SkyVision preview: http://127.0.0.1:4173\n'));
