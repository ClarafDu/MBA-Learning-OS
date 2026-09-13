export type KnowledgeNode={id:string;zh:string;en:string;definitionZh:string;definitionEn:string;courses:string[];related:string[];exampleZh:string;exampleEn:string};
import nodes from '@/content/public/knowledge.json';
export const knowledge:KnowledgeNode[]=nodes;
