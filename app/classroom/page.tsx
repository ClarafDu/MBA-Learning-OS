import { T } from '@/app/components/Language';
import ClassroomWorkspace from '@/app/components/ClassroomWorkspace';
export const metadata={title:'IMBA Classroom · MBA Learning OS'};
export default function Classroom(){return <div className="content"><header className="page-header"><p className="eyebrow"><T>IMBA CLASSROOM</T></p><h1><T>班级学习空间</T></h1><p><T>课程结构已经就绪。教师课件与班级笔记需要经过身份验证才能共享。</T></p></header><ClassroomWorkspace/></div>;}
