'use strict';
const fs=require('fs'),path=require('path'),{spawn}=require('child_process'),config=require('./config-loader.cjs').h3;
let starting=false,error='';
async function ensure(){
  try{const r=await fetch(config.url+'/system_stats',{signal:AbortSignal.timeout(1500)});if(r.ok)return {ready:true};}catch{}
  if(!config.python||!config.comfyMain||!config.modelPathsConfig)return {ready:false,message:'H3 尚未配置；请填写 config.local.json，或先手动启动 8189 后台。'};
  if(!starting){starting=true;try{
    const runtime=path.resolve(config.runtimeDir||path.join(__dirname,'h3-runtime'));for(const name of ['input','output','temp','user','cache'])fs.mkdirSync(path.join(runtime,name),{recursive:true});
    for(const file of [config.python,config.comfyMain,config.modelPathsConfig])if(!fs.existsSync(file))throw Error('H3 配置路径不存在：'+file);
    const logs=path.join(__dirname,'.replica-tools');fs.mkdirSync(logs,{recursive:true});const log=fs.openSync(path.join(logs,'h3-background.log'),'a');
    const args=['-s',config.comfyMain,'--listen','127.0.0.1','--port','8189','--disable-auto-launch','--disable-all-custom-nodes','--base-directory',runtime,'--input-directory',path.join(runtime,'input'),'--output-directory',path.join(runtime,'output'),'--temp-directory',path.join(runtime,'temp'),'--user-directory',path.join(runtime,'user'),'--database-url','sqlite:///:memory:','--extra-model-paths-config',config.modelPathsConfig,'--cache-none'];
    const child=spawn(config.python,args,{cwd:path.dirname(config.comfyMain),windowsHide:true,detached:true,stdio:['ignore',log,log],env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',HF_HOME:path.join(runtime,'cache'),TORCH_HOME:path.join(runtime,'cache'),TEMP:path.join(runtime,'temp'),TMP:path.join(runtime,'temp')}});
    fs.closeSync(log);child.on('error',e=>{error=e.message;starting=false;});child.on('exit',()=>{starting=false;});child.unref();
  }catch(e){error=e.message;starting=false;}}
  return {ready:false,message:error||'H3 后台正在启动，请稍后重新检查'};
}
module.exports={ensure};
