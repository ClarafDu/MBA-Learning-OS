import { modules, samples, terms } from './content.js';
import { lectures, reference } from './reference.js';
import { caseIntro, caseParts, choices, judgments } from './exam.js';

const $ = id => document.getElementById(id);
const labels = Object.fromEntries(modules.map(([id, title]) => [id, title]));

const lectureName = index => index < 7 ? `Lecture ${index}` : '附录';
const referenceTerms = lectures.flatMap(([first, last], index) =>
  reference.slice(first - 1, last).map((term, offset) => [`lecture-${index}`, ...term, first + offset])
);
const allTerms = [...referenceTerms, ...terms];

$('axis').innerHTML = lectures.map(([, , title], index) =>
  `<li><button type="button" data-axis="${index}" aria-pressed="false"><span>${index < 7 ? index : '+'}</span><strong>${title}</strong></button></li>`
).join('');

function selectLecture(index) {
  const [first, last, title, question, chain, tip] = lectures[index];
  for (const button of $('axis').querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(Number(button.dataset.axis) === index));
  }
  $('axis-detail').innerHTML = `<p class="eyebrow">${lectureName(index)} · 参考条目 #${first}–${last}</p>
    <h3>${title} · ${question}</h3>
    <ol class="reasoning-chain" aria-label="推理顺序">${chain.split(' → ').map(step => `<li>${step}</li>`).join('')}</ol>
    <p><strong>考试应用</strong> · ${tip}</p>
    <a href="#glossary" data-module="lecture-${index}">检索本讲 ${last - first + 1} 个参考条目 →</a>`;
}

$('axis').addEventListener('click', event => {
  const button = event.target.closest('[data-axis]');
  if (button) selectLecture(Number(button.dataset.axis));
});
selectLecture(0);

$('category').insertAdjacentHTML('beforeend', `
  <optgroup label="学姐参考 · 46 项">${lectures.map(([, , title], i) =>
    `<option value="lecture-${i}">${lectureName(i)} · ${title}</option>`
  ).join('')}</optgroup>
  <optgroup label="扩展术语">${modules.map(([id, title]) =>
    `<option value="${id}">${title}</option>`
  ).join('')}</optgroup>`);

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
    const searchable = (term.join(' ') + (number ? ` #${number} ${lectureName(Number(term[0].slice(8)))} ${aliases[number] || ''}` : '')).toLowerCase();
    return (!category || term[0] === category) && query.every(word => /^#\d+$/.test(word) ? number === Number(word.slice(1)) : searchable.includes(word));
  });
  $('term-count').textContent = matching.length
    ? `显示 ${matching.length} / ${allTerms.length} 个条目`
    : '没有匹配术语。可切换到全部条目，或尝试中英文关键词。';
  $('terms').innerHTML = matching.map(([id, english, chinese, definition, example, application, number]) =>
    `<article class="panel"><p class="eyebrow">${number ? `学姐参考 #${number} · ${lectureName(Number(id.slice(8)))}` : `扩展 · ${labels[id]}`}</p><h3>${chinese}</h3><p class="muted" lang="en">${english}</p><dl><dt>术语解析</dt><dd>${definition}</dd><dt>示例</dt><dd>${example}</dd><dt>应用场景</dt><dd>${application}</dd></dl></article>`
  ).join('');
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
renderTerms();

$('sample-list').innerHTML = samples.map(([title, prompt, answer, note]) =>
  `<details><summary>${title} · ${prompt}</summary><p lang="en">${answer}</p><p class="muted">${note}</p></details>`
).join('');

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
  $('progress').textContent = `已答 ${answered} / 14（案例须答完四问）`;
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
  return category ? ` <a href="#glossary" data-module="${category}">回查术语 →</a>` : '';
}

function results() {
  const answers = state.answers;
  const aScore = choices.filter(([, , correct], i) => answers['a' + i] === String(correct)).length;
  const bScore = judgments.filter(([, correct], i) => answers['b' + i] === correct).length;
  $('results').innerHTML = `<h3>模拟卷复盘</h3><p>单选 ${aScore} / 10 · 判断方向 ${bScore} / 3</p>
    <p class="muted">简答和案例按得分点自评。可对照上方保留的作答逐项检查。</p>
    ${choices.map(([prompt, items, correct, explanation, category], i) => {
      const chosen = answers['a' + i];
      const status = chosen === undefined ? '未答' : chosen === String(correct) ? '答对' : '答错';
      return `<details><summary>A${i + 1} · ${status} · ${prompt}</summary><p>你的选项 ${chosen === undefined ? '—' : String.fromCharCode(65 + Number(chosen))} · 正解 ${String.fromCharCode(65 + correct)}. ${items[correct]}</p><p lang="en">${explanation}</p>${reviewLink(category)}</details>`;
    }).join('')}
    ${judgments.map(([prompt, correct, , model, rubric, category], i) =>
      `<details><summary>B${i + 1} · ${prompt}</summary><p>你的判断 ${answers['b' + i] || '—'} · 正解 ${correct}</p><p lang="en">${model}</p><p>得分点 · ${rubric}</p>${reviewLink(category)}</details>`
    ).join('')}
    ${caseParts.map(([prompt, , model, rubric], i) =>
      `<details><summary>C${i + 1} · ${prompt}</summary><p lang="en">${model}</p><p>得分点 · ${rubric}</p></details>`
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
    $('timer').textContent = remaining === 0 ? '时间到' : '已交卷';
    return;
  }
  const seconds = Math.ceil(remaining / 1000);
  $('timer').textContent = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(value => String(value).padStart(2, '0')).join(':');
  if (state.deadline && seconds === 0) {
    submit(false);
    $('timer').textContent = '时间到';
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
  if (!window.confirm('清空这套模拟卷的作答和计时，重新开始？')) return;
  state = blank();
  save();
  $('results').hidden = true;
  refresh();
  tick();
  $('start').focus();
});
refresh();
if (state.submitted) results();
tick();
setInterval(tick, 1000);

const offlineStatus = $('offline-status');
if ('serviceWorker' in navigator) {
  if (navigator.serviceWorker.controller) offlineStatus.textContent = '离线缓存已就绪，可断网重新打开本页验证。';
  $('offline-save').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    offlineStatus.textContent = '正在下载复习页及词典、模拟卷资源…';
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
      offlineStatus.textContent = '离线缓存已就绪，可断网重新打开本页验证。';
    } catch {
      offlineStatus.textContent = '离线缓存失败，请联网重试，或下载笔记文件。';
    } finally {
      button.disabled = false;
    }
  });
} else {
  $('offline-save').disabled = true;
  offlineStatus.textContent = '此浏览器无法缓存复习页，可使用本地笔记文件。';
}
