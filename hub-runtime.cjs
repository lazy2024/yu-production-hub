'use strict';
const fs=require('fs'),path=require('path'),{spawn}=require('child_process'),config=require('./config-loader.cjs').primary;
let child=null,attempted=false,failed='',startedAt=0;
async function reachable(){try{const r=await fetch(config.url+'/system_stats',{signal:AbortSignal.timeout(1500)});return r.ok;}catch{return false;}}
async function ensure(){
  if(await reachable())return {ready:true,message:'主生成引擎已就绪'};
  if(failed)return {ready:false,message:failed};
  if(!config.python||!config.comfyDir)return {ready:false,message:'请复制 config.example.json 为 config.local.json，并填写 ComfyUI 路径；也可以先手动启动 8188 后台。'};
  if(!attempted){attempted=true;startedAt=Date.now();try{
    const main=path.join(config.comfyDir,'main.py');if(!fs.existsSync(config.python)||!fs.existsSync(main))throw Error('config.local.json 中的主 ComfyUI 路径无效');
    const dir=path.join(__dirname,'.replica-tools');fs.mkdirSync(dir,{recursive:true});const log=fs.openSync(path.join(dir,'comfy-background.log'),'a');
    child=spawn(config.python,['-s','main.py','--listen','127.0.0.1','--port','8188','--disable-auto-launch'],{cwd:config.comfyDir,windowsHide:true,detached:true,stdio:['ignore',log,log]});
    fs.closeSync(log);child.on('error',e=>{failed='后台启动失败：'+e.message;});child.on('exit',code=>{if(code!==null)failed='主后台已退出，请查看日志';});child.unref();
  }catch(e){failed=e.message;}}
  return {ready:false,message:failed||(Date.now()-startedAt>600000?'后台启动超时，请检查日志':'正在启动主 ComfyUI 后台…')};
}
module.exports={ensure};
