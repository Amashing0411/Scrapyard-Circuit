import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png"};
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,"http://localhost");
    let name=decodeURIComponent(url.pathname);
    if(name==="/")name="/preview/";
    if(name.endsWith("/"))name+="index.html";
    const full=path.resolve(root,"."+name);
    if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end("Forbidden");return;}
    const data=await fs.readFile(full);
    res.writeHead(200,{"Content-Type":mime[path.extname(full)]||"application/octet-stream","Cache-Control":"no-store"});
    res.end(data);
  }catch{res.writeHead(404,{"Content-Type":"text/plain"});res.end("Not found");}
}).listen(8008,"127.0.0.1",()=>console.log("IRONFRAME preview: http://localhost:8008/preview/"));
