import { T } from '@/app/components/Language';
import Link from 'next/link';
export const metadata={title:'IMBA Classroom · MBA Learning OS'};
export default function Classroom(){return <div className="content"><header className="page-header"><p className="eyebrow"><T>IMBA CLASSROOM</T></p><h1><T>班级学习空间</T></h1><p><T>课程结构已经就绪。教师课件与班级笔记需要经过身份验证才能共享。</T></p></header><section className="access-card"><span className="pill"><T>班级访问尚未启用</T></span><h2><T>当前可以浏览课程目录</T></h2><p><T>本公开版本未接入邮箱验证码和班级白名单，因此不提供受限课件的在线查看或下载。</T></p><Link className="button" href="/courses"><T>浏览 2026 Fall 课程</T></Link><div className="notice"><T>后续启用个人邮箱验证后，再导入真实课堂资料。当前安装包不包含教师 PDF、PPT 或私人笔记。</T></div></section></div>;}
