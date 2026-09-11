import { T } from '@/app/components/Language';
import Link from 'next/link';
import ChineseExplanation from '@/app/components/ChineseExplanation';
import RecallQuestion from '@/app/components/RecallQuestion';
import NoteEditor from '@/app/components/NoteEditor';
import { catalog, getConcept, getCourse, getLecture } from '@/lib/catalog';

export function generateStaticParams() {
  return catalog.lectures.map((lecture) => ({ course: lecture.course, lecture: lecture.slug }));
}

export async function generateMetadata({params}: {params: Promise<{course:string;lecture:string}>}) {
  const {course,lecture}=await params;
  return {title:(getLecture(course,lecture)?.title || 'Lecture')+' · MBA Learning OS'};
}

export default async function LecturePage({ params }: { params: Promise<{ course: string; lecture: string }> }) {
  const { course: courseSlug, lecture: lectureSlug } = await params;
  const course = getCourse(courseSlug);
  const lecture = getLecture(courseSlug, lectureSlug);
  if (!course || !lecture) return <div className="content inner-page"><h1><T>Lecture not found</T></h1></div>;
  const concepts = lecture.concepts.map(getConcept).filter(Boolean);

  return (
    <div className="content inner-page lecture-page">
      <div className="breadcrumbs"><Link href="/courses"><T>Courses</T></Link><span><T>/</T></span><Link href={`/courses/${course.slug}`}><T>{course.code}</T></Link><span><T>/</T></span><b><T>Lecture 0</T><T>{lecture.number}</T></b></div>
      <header className="page-header lecture-header">
        <p className="eyebrow"><T>{course.title.toUpperCase()}</T><T> · LECTURE 0</T><T>{lecture.number}</T></p>
        <h1><T>{lecture.title}</T></h1>
        <p><T>{lecture.summary}</T></p>
        <div className="lecture-status"><span><T>{lecture.status}</T></span><small><T>{lecture.date}</T></small></div>
      </header>

      <nav className="lecture-jump" aria-label="Lecture sections / 课堂分区">
        <a href="#before"><T>Before class</T></a><a href="#in-class"><T>In class</T></a><a href="#after"><T>After class</T></a><a href="#quick-review"><T>Quick review</T></a>
      </nav>

      <section className="learning-section" id="before">
        <div className="section-index"><T>01</T></div>
        <div className="section-body"><p className="eyebrow"><T>BEFORE CLASS · 60 MIN</T></p><h2><T>Prepare with a fixed timebox</T></h2>
          <div className="timebox-grid"><article><b><T>20 min</T></b><h3><T>Scan</T></h3><p><T>Map the lecture structure. Mark only what looks central or unclear.</T></p></article><article><b><T>20 min</T></b><h3><T>Understand</T></h3><p><T>Read the three concepts below. Do not write a full summary yet.</T></p></article><article><b><T>20 min</T></b><h3><T>Think</T></h3><p><T>Bring three managerial ideas and one precise question to class.</T></p></article></div>
        </div>
      </section>

      <section className="learning-section concepts-section">
        <div className="section-index"><T>02</T></div>
        <div className="section-body"><p className="eyebrow"><T>CORE CONCEPTS</T></p><h2><T>Understand once, reuse everywhere</T></h2>
          <T>{concepts.map((concept) => concept ? <article className="concept-block" key={concept.slug} id={concept.slug}>
            <div><span className="pill amber"><T>CONCEPT</T></span><h3><T>{concept.title}</T></h3><p><T>{concept.english}</T></p><ChineseExplanation><T>{concept.chinese}</T></ChineseExplanation></div>
            <aside><small><T>FORMULA / RULE</T></small><strong><T>{concept.formula}</T></strong><small><T>MANAGERIAL MEANING</T></small><p><T>{concept.managerialMeaning}</T></p></aside>
          </article> : null)}</T>
        </div>
      </section>

      <section className="learning-section" id="in-class">
        <div className="section-index"><T>03</T></div>
        <div className="section-body"><p className="eyebrow"><T>IN CLASS</T></p><h2><T>Capture signal, not a transcript</T></h2>
          <div className="note-template"><div><b><T>Professor examples</T></b><p><T>Add examples and applications from the lecture.</T></p></div><div><b><T>Important</T></b><p><T>Mark claims likely to matter for an assignment or exam.</T></p></div><div><b><T>Questions</T></b><p><T>Write the shortest version of what remains unclear.</T></p></div><div><b><T>Confusing</T></b><p><T>Capture the exact step where understanding breaks.</T></p></div></div>
          <NoteEditor id={course.slug+'-'+lecture.slug+'-in-class'} label="Student Notes · 课堂笔记"/>
        </div>
      </section>

      <section className="learning-section" id="after">
        <div className="section-index"><T>04</T></div>
        <div className="section-body"><p className="eyebrow"><T>AFTER CLASS</T></p><h2><T>Turn raw notes into decisions</T></h2><div className="after-prompts"><span><T>One-sentence summary</T></span><span><T>Key concepts</T></span><span><T>Difficult points</T></span><span><T>Managerial meaning</T></span><span><T>Examples</T></span><span><T>Mistakes</T></span></div><NoteEditor id={course.slug+'-'+lecture.slug+'-after-class'} label="课后总结与易错点"/></div>
      </section>

      <section className="learning-section review-section" id="quick-review">
        <div className="section-index"><T>05</T></div>
        <div className="section-body"><p className="eyebrow"><T>QUICK REVIEW · 5–10 MIN</T></p><h2><T>Recall before you reread</T></h2><p className="section-intro"><T>Answer from memory, reveal the answer, then choose whether it returns to the queue.</T></p>
          <div className="recall-list"><T>{lecture.recallQuestions.map((item, index) => <RecallQuestion key={item.id} id={item.id} number={index + 1} question={item.question} answer={item.answer} />)}</T></div>
          <div className="button-row"><Link className="button secondary" href="/review"><T>进入专注复习</T></Link><Link href={`/courses/${course.slug}`}><T>返回课程总览</T></Link></div>
        </div>
      </section>
    </div>
  );
}
