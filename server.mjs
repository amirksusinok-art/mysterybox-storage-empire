import {createServer} from 'node:http'
import {createReadStream} from 'node:fs'
import {stat} from 'node:fs/promises'
import {resolve,sep,extname} from 'node:path'

const root=resolve('dist')
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp'}
createServer(async (request,response)=>{
  try{
    if(request.method!=='GET'&&request.method!=='HEAD'){
      response.writeHead(405,{Allow:'GET, HEAD'}).end()
      return
    }
    const path=decodeURIComponent(new URL(request.url,'http://localhost').pathname)
    const file=resolve(root,'.'+(path==='/'?'/index.html':path))
    if(!file.startsWith(root+sep)||(await stat(file)).isFile()===false){
      response.writeHead(404).end('Not found')
      return
    }
    response.writeHead(200,{
      'Content-Type':types[extname(file)]??'application/octet-stream',
      'Cache-Control':path.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache',
      'X-Content-Type-Options':'nosniff',
    })
    if(request.method==='HEAD')response.end()
    else createReadStream(file).on('error',()=>response.destroy()).pipe(response)
  }catch{
    response.writeHead(404).end('Not found')
  }
}).listen(Number(process.env.PORT??4173),'0.0.0.0')
