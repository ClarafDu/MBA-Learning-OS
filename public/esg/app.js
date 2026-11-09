import { lectureEnglish, moduleEnglish, sampleEnglish, judgmentRubrics, caseRubrics, extendedEnglish } from './locale.js';
import { modules, samples, terms } from './content.js';
import { englishReference, subtopics } from './bilingual.js';
import { lectures, reference } from './reference.js';
import { caseIntro, caseParts, choices, judgments } from './exam.js';

const $ = id => document.getElementById(id);
const moduleLabels = Object.fromEntries(modules.map(([id, title]) => [id, title]));

const sectionNav = document.querySelector('.section-nav');
const sectionLinks = [...sectionNav.querySelectorAll('a')];
const sections = sectionLinks.map(link => $(link.hash.slice(1)));

function markCurrentSection() {
  const index = sections.findLastIndex(section => section.getBoundingClientRect().top <= 32);
  sectionLinks.forEach((link, i) => {
    if (i === index) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

window.addEventListener('scroll', markCurrentSection, {passive:true});
window.addEventListener('resize', markCurrentSection);

const languageKey = 'mba-learning-language';
const requestedLanguage = new URLSearchParams(location.search).get('lang');
let englishMode = requestedLanguage === 'en';
try {
  if (requestedLanguage !== 'en' && requestedLanguage !== 'zh') {
    const savedLanguage = localStorage.getItem(languageKey);
    englishMode = savedLanguage ? savedLanguage === 'en' : !navigator.language.toLowerCase().startsWith('zh');
  }
} catch {
  // Explicit language links and the switch still work without browser storage.
}
const t = (zh, en) => englishMode ? en : zh;
const staticText = [...document.querySelectorAll('[data-en]')].map(node => [node, node.textContent]);
let selectedLecture = 0;
let offlineMessage = ['', ''];
function showOffline(zh, en) {
  offlineMessage = [zh, en];
  $('offline-status').textContent = t(zh, en);
}

const lectureName = index => index < 7 ? `Lecture ${index}` : t('附录', 'Appendix');
const referenceTerms = lectures.flatMap(([first, last], index) =>
  reference.slice(first - 1, last).flatMap((term, offset) => {
    const number = first + offset;
    const group = `lecture-${index}`;
    return [[group, ...term, number, englishReference[number - 1]],
      ...subtopics.filter(([parent]) => parent === number).map(([, en, zh, definition, example, use, ...translation], i) =>
        [group, en, zh, definition, example, use, number, translation, i + 1]
      )];
  })
);
const allTerms = [...referenceTerms, ...terms.map((term, i) => [...term, null, extendedEnglish[i]])];

function renderFramework() {
  $('axis').innerHTML = lectures.map(([, , title], index) =>
    `<li><button type="button" data-axis="${index}" aria-pressed="false"><span>${index < 7 ? index : '+'}</span><strong>${t(title, lectureEnglish[index][0])}</strong></button></li>`
  ).join('');
  selectLecture(selectedLecture);
}

function selectLecture(index) {
  selectedLecture = index;
  const [first, last, ...chinese] = lectures[index];
  const [title, question, chain, tip] = t(chinese, lectureEnglish[index]);
  for (const button of $('axis').querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(Number(button.dataset.axis) === index));
  }
  $('axis-detail').innerHTML = `<p class="eyebrow">${lectureName(index)} · ${t('参考条目', 'Reference entries')} #${first}–${last}</p>
    <h3>${title} · ${question}</h3>
    <ol class="reasoning-chain" aria-label="${t('推理顺序', 'Reasoning steps')}">${chain.split(' → ').map(step => `<li>${step}</li>`).join('')}</ol>
    <p><strong>${t('考试应用', 'Exam application')}</strong> · ${tip}</p>
    <a href="#glossary" data-module="lecture-${index}">${t('检索本讲主条目与子条目', 'Open this lecture in the glossary')} →</a>`;
}

$('axis').addEventListener('click', event => {
  const button = event.target.closest('[data-axis]');
  if (button) selectLecture(Number(button.dataset.axis));
});
function renderCategories() {
  const category = $('category').value;
  $('category').innerHTML = `<option value="">${t('全部条目', 'All entries')}</option>
    <optgroup label="${t('PDF 参考 · 主条目与子条目', 'PDF reference topics and subtopics')}">${lectures.map(([, , title], i) =>
      `<option value="lecture-${i}">${lectureName(i)} · ${t(title, lectureEnglish[i][0])}</option>`
    ).join('')}</optgroup>
    <optgroup label="${t('扩展术语', 'Additional terms')}">${modules.map(([id, title]) =>
      `<option value="${id}">${t(title, moduleEnglish[id])}</option>`
    ).join('')}</optgroup>`;
  $('category').value = category;
}

const aliases = {
  9: 'instrumental intrinsic needs wants',
  10: 'negative rights positive rights contractual rights',
  11: 'formula of universal law formula of humanity universalizability reversibility',
  12: 'distributive retributive compensatory justice fair equality of opportunity difference principle equal liberty',
  16: 'inside-out outside-in shared value',
  35: 'intentional discrimination institutional discrimination',
  43: 'SRI best-in-class thematic green social impact ethical faith-based negative screening',
};

function renderTerms() {
  const query = $('search').value.trim().toLowerCase().split(/\s+/);
  const category = $('category').value;
  const matching = allTerms.filter(term => {
    const number = term[6];
    const searchable = (term.flat().join(' ') + (number ? ` #${number} ${lectureName(Number(term[0].slice(8)))} ${aliases[number] || ''}` : '')).toLowerCase();
    return (!category || term[0] === category) && query.every(word => /^#\d+$/.test(word) ? number === Number(word.slice(1)) : /^#\d+\.\d+$/.test(word) ? word === `#${number}.${term[8]}` : searchable.includes(word));
  });
  $('term-count').textContent = matching.length
    ? t(`显示 ${matching.length} / ${allTerms.length} 个条目`, `Showing ${matching.length} of ${allTerms.length} entries`)
    : t('没有匹配术语。可切换到全部条目，或尝试中英文关键词。', 'No matches. Try a different keyword or select All entries.');
  $('terms').innerHTML = matching.map(([id, english, chinese, definition, example, application, number, translation, child]) => {
    const labels = t(['术语解析 / Definition', '示例 / Example', '应用场景 / Application'], ['Definition', 'Example', 'Application']);
    const body = [definition, example, application].map((text, i) =>
      `<dt>${labels[i]}</dt><dd>${t(text, translation[i])}${!englishMode ? `<p class="term-english" lang="en">${translation[i]}</p>` : ''}</dd>`
    ).join('');
    const source = number ? `PDF #${number}${child ? '.' + child : ''} · ${lectureName(Number(id.slice(8)))}` : t(`扩展 · ${moduleLabels[id]}`, `Additional · ${moduleEnglish[id]}`);
    return `<article class="panel"><p class="eyebrow">${source}</p><h3>${t(chinese, english)}</h3><p class="muted" lang="${t('en', 'zh-CN')}">${t(english, chinese)}</p><dl>${body}</dl></article>`;
  }).join('');
}

$('search').addEventListener('input', renderTerms);
$('category').addEventListener('change', renderTerms);
document.addEventListener('click', event => {
  const link = event.target.closest('[data-module]');
  if (!link) return;
  $('category').value = link.dataset.module;
  $('search').value = '';
  renderTerms();
});
function renderSamples() {
  const open = [...$('sample-list').querySelectorAll('details')].map(detail => detail.open);
  $('sample-list').innerHTML = samples.map(([zhTitle, zhPrompt, answer, zhNote], i) => {
    const [title, prompt, note] = t([zhTitle, zhPrompt, zhNote], sampleEnglish[i]);
    return `<details ${open[i] ? 'open' : ''}><summary>${title} · ${prompt}</summary><p lang="en">${answer}</p><p class="muted">${note}</p></details>`;
  }).join('');
}

const exam = $('exam');
const storageKey = 'imba-esg-mock-v1';
const duration = 120 * 60 * 1000;
const blank = () => ({ answers: {}, deadline: 0, submitted: false });
let state = blank();
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved?.answers && typeof saved.deadline === 'number') state = saved;
} catch {
  // The exam still works in memory if browser storage is unavailable.
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Browser storage can be disabled.
  }
}

function options(name, items) {
  return items.map(([value, label]) =>
    `<label class="option"><input type="radio" name="${name}" value="${value}"> ${label}</label>`
  ).join('');
}

function response(name, label, limit) {
  return `<label for="${name}">${label} · ≤ ${limit} words</label><textarea name="${name}" id="${name}" data-limit="${limit}" aria-describedby="${name}-count"></textarea><small id="${name}-count"></small>`;
}

exam.innerHTML = `
  <h3>Part A · Single best answer</h3>
  ${choices.map(([prompt, items], i) =>
    `<fieldset lang="en"><legend>${i + 1}. ${prompt}</legend>${options('a' + i, items.map((label, j) => [j, String.fromCharCode(65 + j) + '. ' + label]))}</fieldset>`
  ).join('')}
  <h3>Part B · Yes or No with a short explanation</h3>
  ${judgments.map(([prompt, , limit], i) =>
    `<fieldset lang="en"><legend>${i + 1}. ${prompt}</legend>${options('b' + i, [['Yes', 'Yes'], ['No', 'No']])}${response('why' + i, 'Explanation', limit)}</fieldset>`
  ).join('')}
  <h3>Part C · Case analysis</h3>
  <p lang="en">${caseIntro}</p>
  ${caseParts.map(([prompt, limit], i) =>
    `<fieldset lang="en"><legend>${i + 1}. ${prompt}</legend>${response('c' + i, 'Your answer', limit)}</fieldset>`
  ).join('')}`;

const fields = [...exam.querySelectorAll('input, textarea')];
function refresh() {
  const answers = state.answers;
  const filled = name => Boolean(answers[name]?.trim());
  const answered = choices.filter((_, i) => filled('a' + i)).length
    + judgments.filter((_, i) => filled('b' + i) && filled('why' + i)).length
    + Number(caseParts.every((_, i) => filled('c' + i)));
  $('progress').textContent = t(`已答 ${answered} / 14（案例须答完四问）`, `Answered ${answered} / 14 (the case counts when all four parts are answered)`);
  for (const field of fields) {
    field.disabled = state.submitted;
    if (field.type === 'radio') {
      field.checked = field.value === answers[field.name];
    } else {
      field.value = answers[field.name] || '';
      const count = field.value.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length || 0;
      const counter = $(field.id + '-count');
      counter.textContent = `${count} / ${field.dataset.limit} words`;
      counter.classList.toggle('over-limit', count > Number(field.dataset.limit));
    }
  }
  $('start').disabled = Boolean(state.deadline || state.submitted);
  document.querySelector('[form="exam"]').disabled = state.submitted;
}

function reviewLink(category) {
  return category ? ` <a href="#glossary" data-module="${category}">${t('回查术语', 'Review related terms')} →</a>` : '';
}

function results() {
  const answers = state.answers;
  const aScore = choices.filter(([, , correct], i) => answers['a' + i] === String(correct)).length;
  const bScore = judgments.filter(([, correct], i) => answers['b' + i] === correct).length;
  $('results').innerHTML = `<h3>${t('模拟卷复盘', 'Mock exam review')}</h3><p>${t('单选', 'Multiple choice')} ${aScore} / 10 · ${t('判断方向', 'Yes/No choices')} ${bScore} / 3</p>
    <p class="muted">${t('简答和案例按得分点自评。可对照上方保留的作答逐项检查。', 'Use the rubrics to compare your written explanations and case responses with the model answers.')}</p>
    ${choices.map(([prompt, items, correct, explanation, category], i) => {
      const chosen = answers['a' + i];
      const status = chosen === undefined ? t('未答', 'Unanswered') : chosen === String(correct) ? t('答对', 'Correct') : t('答错', 'Incorrect');
      return `<details><summary>A${i + 1} · ${status} · ${prompt}</summary><p>${t('你的选项', 'Your choice')} ${chosen === undefined ? '—' : String.fromCharCode(65 + Number(chosen))} · ${t('正解', 'Answer')} ${String.fromCharCode(65 + correct)}. ${items[correct]}</p><p lang="en">${explanation}</p>${reviewLink(category)}</details>`;
    }).join('')}
    ${judgments.map(([prompt, correct, , model, rubric, category], i) =>
      `<details><summary>B${i + 1} · ${prompt}</summary><p>${t('你的判断', 'Your choice')} ${['Yes', 'No'].includes(answers['b' + i]) ? answers['b' + i] : '—'} · ${t('正解', 'Answer')} ${correct}</p><p lang="en">${model}</p><p>${t('得分点', 'Scoring points')} · ${t(rubric, judgmentRubrics[i])}</p>${reviewLink(category)}</details>`
    ).join('')}
    ${caseParts.map(([prompt, , model, rubric], i) =>
      `<details><summary>C${i + 1} · ${prompt}</summary><p lang="en">${model}</p><p>${t('得分点', 'Scoring points')} · ${t(rubric, caseRubrics[i])}</p></details>`
    ).join('')}`;
  $('results').hidden = false;
}

function submit(focus = true) {
  state.submitted = true;
  save();
  refresh();
  results();
  if (focus) $('results').focus();
}

function tick() {
  const remaining = state.deadline ? Math.max(0, state.deadline - Date.now()) : duration;
  if (state.submitted) {
    $('timer').textContent = remaining === 0 ? t('时间到', 'Time is up') : t('已交卷', 'Submitted');
    return;
  }
  const seconds = Math.ceil(remaining / 1000);
  $('timer').textContent = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(value => String(value).padStart(2, '0')).join(':');
  if (state.deadline && seconds === 0) {
    submit(false);
    $('timer').textContent = t('时间到', 'Time is up');
  }
}

exam.addEventListener('input', event => {
  state.answers[event.target.name] = event.target.value;
  save();
  refresh();
});
exam.addEventListener('submit', event => {
  event.preventDefault();
  submit();
  tick();
});
$('start').addEventListener('click', () => {
  state.deadline = Date.now() + duration;
  save();
  refresh();
  tick();
});
$('reset').addEventListener('click', () => {
  if (!window.confirm(t('清空这套模拟卷的作答和计时，重新开始？', 'Clear your answers and timer and start over?'))) return;
  state = blank();
  save();
  $('results').hidden = true;
  refresh();
  tick();
  $('start').focus();
});
function renderLanguage() {
  document.documentElement.lang = t('zh-CN', 'en');
  document.title = t('ESG 考前自学', 'ESG Exam Review') + ' | MBA Learning OS';
  $('lang-zh').setAttribute('aria-pressed', String(!englishMode));
  $('lang-en').setAttribute('aria-pressed', String(englishMode));
  for (const [node, zh] of staticText) node.textContent = t(zh, node.dataset.en);
  sectionNav.setAttribute('aria-label', t('复习导航', 'Review navigation'));
  document.querySelector('#offline-save').closest('section').setAttribute('aria-label', t('离线使用', 'Offline access'));
  $('axis').setAttribute('aria-label', t('课程复习轴', 'Lecture study path'));
  $('timer').setAttribute('aria-label', t('剩余时间', 'Time remaining'));
  $('search').placeholder = t('如 free rider、正义、Scope 3', 'Try free rider, justice or Scope 3');
  renderFramework();
  renderCategories();
  renderTerms();
  renderSamples();
  refresh();
  if (state.submitted) results();
  tick();
  showOffline(...offlineMessage);
  markCurrentSection();
}

for (const lang of ['zh', 'en']) {
  $('lang-' + lang).addEventListener('click', () => {
    englishMode = lang === 'en';
    try { localStorage.setItem(languageKey, lang); } catch { /* Keep the choice for this page. */ }
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
    renderLanguage();
  });
}
renderLanguage();
setInterval(tick, 1000);

if ('serviceWorker' in navigator) {
  if (navigator.serviceWorker.controller) showOffline('离线缓存已就绪，可断网重新打开本页验证。', 'Offline cache is ready. Disconnect and reopen this page to verify.');
  $('offline-save').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    showOffline('正在下载复习页及词典、模拟卷资源…', 'Downloading the review page, glossary and mock exam…');
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      const worker = registration.installing || registration.waiting || registration.active;
      if (!worker) throw new Error('Service worker unavailable');
      await new Promise((resolve, reject) => {
        function check() {
          if (worker.state === 'activated' || worker.state === 'redundant') {
            worker.removeEventListener('statechange', check);
            if (worker.state === 'activated') resolve();
            else reject(new Error('Offline installation failed'));
          }
        }
        worker.addEventListener('statechange', check);
        check();
      });
      showOffline('离线缓存已就绪，可断网重新打开本页验证。', 'Offline cache is ready. Disconnect and reopen this page to verify.');
    } catch {
      showOffline('离线缓存失败，请联网重试，或下载笔记文件。', 'Caching failed. Reconnect and try again, or download your notes.');
    } finally {
      button.disabled = false;
    }
  });
} else {
  $('offline-save').disabled = true;
  showOffline('此浏览器无法缓存复习页，可使用本地笔记文件。', 'This browser cannot cache the review page. You can use downloaded notes offline.');
}
