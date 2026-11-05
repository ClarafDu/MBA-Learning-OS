const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function derivationHTML(entry,language){
 const en=language==='en',text=value=>esc(value[language]);
 return `<section class="derivation"><h3>${en?'Step-by-step derivation':'逐步推导：每一步怎么来'}</h3><p class="badge">${text(entry.kind)}</p><ol class="derivation-steps">${entry.derivation.map(step=>`<li><p>${text(step)}</p></li>`).join('')}</ol><h3>${en?'Calculation problem and worked solution':'计算题：从已知到答案'}</h3><p class="calculation-question">${text(entry.example.scenario)}</p><ol class="derivation-steps calculation-steps">${entry.example.steps.map(step=>`<li><p>${text(step)}</p></li>`).join('')}</ol></section>`;
}
