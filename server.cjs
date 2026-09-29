'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),engine=require('./hub-engine.cjs'),runtime=require('./hub-runtime.cjs');
const root=__dirname,port=Number(process.env.PORT||8900),assets=new Set(['anjuhub-homepage.html','hub.js','hub.css']);
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://127.0.0.1');if(!['127.0.0.1','localhost'].includes((req.headers.host||'').split(':')[0])){res.writeHead(403);res.end();return;}
if(u.pathname==='/__replica/status'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({app:'yu-production-hub',version:'yu-local-2',mode:'comfy-background'}));return;}
if(u.pathname==='/hub-api/runtime'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(await runtime.ensure()));return;}
if(await engine.handle(req,res))return;
if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
let file=u.pathname.slice(1);if(!file||file==='index.html'||file.endsWith('.html'))file='anjuhub-homepage.html';
if(!assets.has(file)){res.writeHead(404);res.end('Not found');return;}
res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'"});if(req.method==='HEAD')res.end();else fs.createReadStream(path.join(root,file)).pipe(res);
}catch(e){if(!res.headersSent)res.writeHead(500);res.end('Yu Hub error: '+e.message);}}).listen(port,'127.0.0.1',()=>console.log('Yu Production Hub http://127.0.0.1:'+port));
