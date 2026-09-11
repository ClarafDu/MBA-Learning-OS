'use client';
import { T, useLanguage } from '@/app/components/Language';

import { catalog } from '@/lib/catalog';
import { useLearning } from './LearningState';
export default function CourseProgress({course}: {course:string}) {
  const {t} = useLanguage();
  const {progress,ready}=useLearning();
  const cards=catalog.lectures.filter(l=>l.course===course).flatMap(l=>l.recallQuestions);
  const done=cards.filter(q=>progress.reviews[q.id]==='understood').length;
  return <div className="course-progress"><span><T>{cards.length?(ready?done+' / '+cards.length+' 题已理解':'读取进度…'):'尚未添加 Lecture'}</T></span><progress aria-label={t("复习完成进度")} max={cards.length||1} value={done}/></div>;
}
