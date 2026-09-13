import { createClient } from '@supabase/supabase-js';
import config from '@/content/public/cloud.json';
export const cloud = config.url && config.publishableKey ? createClient(config.url,config.publishableKey) : null;
export const aiEnabled=!!cloud&&config.aiEnabled;
export type RecordItem = {id:string;owner:string;key:string;kind:string;visibility:'private'|'class';data:Record<string,unknown>;revision:number;updated_at?:string};
