import {existsSync,readFileSync} from 'node:fs';
export function readHostingConfig(path){
 if(!existsSync(path))return {};
 const data=JSON.parse(readFileSync(path,'utf8'));
 for(const key of ['d1','r2'])if(data[key]!=null&&typeof data[key]!=='string')throw Error('Invalid local hosting binding: '+key);
 return {d1:data.d1??null,r2:data.r2??null};
}
