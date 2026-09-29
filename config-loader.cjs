'use strict';
const fs=require('fs'),path=require('path');
const defaults={primary:{url:'http://127.0.0.1:8188',python:'',comfyDir:'',outputDir:''},h3:{url:'http://127.0.0.1:8189',python:'',comfyMain:'',modelPathsConfig:'',runtimeDir:'',outputDir:''}};
let user={};try{user=JSON.parse(fs.readFileSync(path.join(__dirname,'config.local.json'),'utf8'));}catch{}
module.exports={primary:{...defaults.primary,...user.primary},h3:{...defaults.h3,...user.h3}};
