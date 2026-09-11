import { T } from '@/app/components/Language';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { catalog,getConcept } from '@/lib/catalog';
import ChineseExplanation from '@/app/components/ChineseExplanation';
export function generateStaticParams(){return catalog.concepts.map(c=>({concept:c.slug}));}
export async function generateMetadata({params}:{params:Promise<{concept:string}>}){const {concept}=await params;const c=getConcept(concept);return {title:(c?.title||'Concept')+' · MBA Learning OS',description:c?.english};}
export default async function ConceptPage({params}:{params:Promise<{concept:string}>}){
 const {concept}=await params;const c=getConcept(concept);if(!c)notFound();
 return <div className="content"><nav className="breadcrumbs" aria-label="Breadcrumb / 面包屑"><Link href="/"><T>首页</T></Link><span><T>/</T></span><Link href="/knowledge"><T>知识库</T></Link><span><T>/</T></span><span aria-current="page"><T>{c.title}</T></span></nav><header className="page-header"><p className="eyebrow"><T>CONCEPT / PUBLIC KNOWLEDGE</T></p><h1><T>{c.title}</T></h1><p><T>{c.english}</T></p><ChineseExplanation><T>{c.chinese}</T></ChineseExplanation></header><section className="panel"><h2><T>Formula / Decision rule</T></h2><div className="answer"><T>{c.formula}</T></div><h2><T>Managerial meaning</T></h2><p><T>{c.managerialMeaning}</T></p></section><section className="course-section"><h2><T>关联课堂</T></h2><div className="topic-links"><T>{catalog.lectures.filter(l=>l.concepts.includes(c.slug)).map(l=><Link key={l.course+l.slug} href={'/courses/'+l.course+'/'+l.slug+'#'+c.slug}><T>ME · Lecture </T><T>{l.number}</T><T> · 示例</T></Link>)}</T></div></section><section className="course-section"><h2><T>辅助学习资源</T></h2><div className="resource-list"><a href="https://openstax.org/details/books/principles-economics-3e" target="_blank" rel="noreferrer"><span><b><T>OpenStax · Principles of Economics 3e</T></b><small><T>Learn · 英文 · 入门 · 按目录查找相关章节，约 15–20 分钟</T></small></span><span aria-label="Open in new tab / 在新标签页打开"><T>↗</T></span></a></div></section></div>;
}
