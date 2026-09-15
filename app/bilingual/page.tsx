import Link from 'next/link';
import { T } from '../components/Language';

export default function Page(){
  return <div className="content-page">
    <header className="page-header">
      <p className="eyebrow"><T>辅助工具 · UTILITY</T></p>
      <h1><T>翻译工具</T></h1>
      <p><T>翻译不再占用产品主入口；课程与知识点的双语内容仍保留在 Map 中。</T></p>
    </header>
    <section className="panel">
      <h2><T>需要翻译自由文本？</T></h2>
      <p><T>使用 Google 翻译处理临时文本，再回到 Map 记录与课程相关的表达。</T></p>
      <div className="button-row">
        <a className="button" href="https://translate.google.com/" target="_blank" rel="noreferrer"><T>打开 Google 翻译</T> ↗</a>
        <Link className="button secondary" href="/map"><T>返回 Map</T></Link>
      </div>
    </section>
  </div>;
}
