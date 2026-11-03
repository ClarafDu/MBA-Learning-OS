import {market,pricing,welfare,membership,bundle,bestResponses,entry,oligopoly,acquisition,incentives,location} from './math.js';
export const labInfo={market:['供需与曲线移动','Supply & demand'],pricing:['价格、收入与利润','Price, revenue & profit'],surplus:['交易创造的剩余','Gains from trade'],tax:['税收楔子与损失','Tax wedge & loss'],membership:['会员费与参与','Membership & participation'],bundle:['单卖还是套餐','Separate or bundle'],matrix:['最佳反应与均衡','Best responses & equilibrium'],tree:['进入与可信威胁','Entry & credible threats'],oligopoly:['竞争模型比较','Competition models'],selection:['报价与成交选择','Offers & selection'],incentive:['指标改变行为','Metrics change behavior'],location:['选址与市场份额','Location & market share']};
const memory=new Map(),f=x=>Number(x).toLocaleString('en-US',{maximumFractionDigits:2}),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function disposeLabs(){} // Labs use synchronous input only, with no timers or global listeners.
export function mountLab(host,id,lang='zh',context={}){
 if(!host||!labInfo[id])return;
 const I=(z,e)=>lang==='en'?e:z;
 const configurations={
  market:[['a','需求截距','Demand intercept',80,140,100],['c','供给截距','Supply intercept',0,50,10]],
  pricing:[['price','售价','Price',0,100,30],['cost','边际成本','Marginal cost',0,40,10],['fixed','固定成本','Fixed cost',0,500,100]],
  surplus:[['a','需求截距','Demand intercept',80,140,100],['c','供给截距','Supply intercept',0,50,10]],
  tax:[['tax','单位税','Unit tax',0,30,15]],
  membership:[['unit','每次使用价','Usage price',0,20,4],['fee','会员费','Access fee',0,200,80]],
  bundle:[['separate','每个单品价','Price per item',0,22,10],['package','套餐价','Package price',0,40,18],['cost','每品MC','MC per item',0,10,2]],
  matrix:[],tree:[['fight','在位者打击收益','Incumbent fight payoff',-40,60,-20],['share','在位者容纳收益','Incumbent accommodate payoff',0,60,40]],
  oligopoly:[['a','需求截距','Demand intercept',20,60,30],['cost','双方MC','Common MC',0,15,6]],
  selection:[['offer','收购报价','Acquisition offer',0,100,60]],
  incentive:[['rate','佣金百分比','Commission percent',1,30,10]],
  location:[['left','A的位置','A location',0,100,25],['right','B的位置','B location',0,100,75]]
 };
 const memoryKey=id+JSON.stringify(context);
 if(id==='pricing')configurations.pricing[0][4]=context.a??100;
 const params=memory.get(memoryKey)||{...Object.fromEntries(configurations[id].map(([key,,,,,value])=>[key,value])),...context};
 if(id==='matrix'&&!params.game)params.game='pd';if(id==='incentive'&&!params.metric)params.metric='revenue';
 host.innerHTML=`<h3>${I(...labInfo[id])}</h3><p class="lab-note">${I('先预测结果，再移动一个参数；数值与图形同步。','Predict first, then move one parameter; values and visuals update together.')}</p><div class="lab-grid">${configurations[id].map(([key,z,e,min,max])=>`<label>${I(z,e)} <output data-output="${key}">${params[key]}</output><input type="range" data-param="${key}" aria-label="${esc(I(z,e))}" min="${min}" max="${max}" step="1" value="${params[key]}"></label>`).join('')}${id==='matrix'?`<label>${I('博弈结构','Game structure')}<select data-param="game"><option value="pd">${I('价格战困境','Pricing dilemma')}</option><option value="coordination">${I('协调博弈','Coordination')}</option><option value="pennies">${I('匹配硬币','Matching pennies')}</option></select></label>`:''}${id==='incentive'?`<label>${I('佣金口径','Commission basis')}<select data-param="metric"><option value="revenue">${I('销售收入','Revenue')}</option><option value="profit">${I('佣金前利润','Profit before commission')}</option></select></label>`:''}</div><div class="plot" data-plot></div><div class="lab-result" data-result role="status" aria-live="polite"></div><p class="lab-note" data-assumptions></p><button type="button" data-reset>${I('重置实验','Reset experiment')}</button>`;
 for(const select of host.querySelectorAll('select'))select.value=params[select.dataset.param];
 const plot=host.querySelector('[data-plot]'),result=host.querySelector('[data-result]'),note=host.querySelector('[data-assumptions]');
 const svg=(body,label)=>`<svg viewBox="0 0 560 330" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>${body}</svg>`;
 const line=(x1,y1,x2,y2,color='#ad4518',width=3,extra='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${width}" fill="none" ${extra}/>`;
 const text=(x,y,s,color='#3c3028')=>`<text x="${x}" y="${y}" fill="${color}" font-size="17">${esc(s)}</text>`;
 function curves(a=100,c=10,tax=0,shade=false,marker=null){
  const m=market(a,2,c,1,tax),X=q=>55+q*7,Y=p=>285-p*1.65;
  let body=line(55,25,55,285,'#9c9086',1)+line(55,285,525,285,'#9c9086',1)+text(15,30,'P')+text(525,313,'Q');
  if(shade){body+=`<polygon points="55,${Y(a)} 55,${Y(m.buyerPrice)} ${X(m.quantity)},${Y(m.buyerPrice)}" fill="#f6b96d" opacity=".55"/><polygon points="55,${Y(c)} 55,${Y(m.sellerPrice)} ${X(m.quantity)},${Y(m.sellerPrice)}" fill="#729cbb" opacity=".35"/>`;}
  body+=line(X(0),Y(a),X(a/2),Y(0))+line(X(0),Y(c),X(60),Y(c+60),'#355d85');
  if(tax)body+=line(X(0),Y(c+tax),X(60),Y(c+tax+60),'#355d85',2,'stroke-dasharray="6 4"');
  const pt=marker||{quantity:m.quantity,price:m.buyerPrice};
  body+=`<circle cx="${X(pt.quantity)}" cy="${Y(pt.price)}" r="6" fill="#3c3028"/>`+line(X(pt.quantity),Y(pt.price),X(pt.quantity),285,'#9c9086',1,'stroke-dasharray="4 4"')+text(X(pt.quantity)-8,310,f(pt.quantity));
  return svg(body,I('纵轴价格P，横轴数量Q；橙色需求、蓝色供给。','Price P vertical, quantity Q horizontal; orange demand and blue supply.'));
 }
 function draw(){
  const p=params;memory.set(memoryKey,{...p});for(const output of host.querySelectorAll('[data-output]'))output.textContent=f(p[output.dataset.output]);
  let html='',summary='',assumptions='';
  if(['market','surplus','tax'].includes(id)){
   const a=p.a??100,c=p.c??10,t=p.tax??0,m=welfare(a,2,c,1,t);html=curves(a,c,t,id!=='market');
   summary=I(`Q=${f(m.quantity)}；买方价=${f(m.buyerPrice)}；卖方价=${f(m.sellerPrice)}`,`Q=${f(m.quantity)}; buyer price=${f(m.buyerPrice)}; seller price=${f(m.sellerPrice)}`);
   if(id!=='market')summary+=I(`；CS=${f(m.cs)}；PS=${f(m.ps)}；税收=${f(m.revenue)}；DWL=${f(m.loss)}`,`; CS=${f(m.cs)}; PS=${f(m.ps)}; tax receipts=${f(m.revenue)}; DWL=${f(m.loss)}`);
   assumptions=I(`需求P=${a}−2Q，供给P=${c}+Q；竞争、线性、无外部性。橙区为CS、蓝区为PS；虚线是含税供给。税收为转移，结果非公平评价。`,`Demand P=${a}−2Q, supply P=${c}+Q; competitive linear curves without externalities. Orange area=CS, blue area=PS; dashed line=tax-inclusive supply. Receipts are transfers; this is not a fairness judgment.`);
  }else if(id==='pricing'){
   const a=p.a??100,b=p.b??2,m=pricing(a,b,p.cost,p.fixed,p.price),X=q=>55+q/(a/b)*450,Y=price=>285-price/a*240;
   summary=I(`销量=${f(m.quantity)}；收入=${f(m.revenue)}；利润=${f(m.profit)}；本模型最优价=${f(m.optimalPrice)}`,`Quantity=${f(m.quantity)}; revenue=${f(m.revenue)}; profit=${f(m.profit)}; model-optimal price=${f(m.optimalPrice)}`);
   // Remove supply: the pricing firm chooses a point on its demand, not a competitive intersection.
   html=svg(line(55,25,55,285,'#9c9086',1)+line(55,285,525,285,'#9c9086',1)+text(15,30,'P')+text(525,313,'Q')+line(55,45,505,285)+line(55,Y(p.cost),505,Y(p.cost),'#355d85',2)+`<circle cx="${X(m.quantity)}" cy="${Y(p.price)}" r="7" fill="#3c3028"/>`,I('需求线上选定的价格与销量；蓝线为MC。','Selected price and quantity on demand; blue line is MC.'));
   assumptions=I(`教学需求Q=(${a}−P)/${b}，MC恒定，固定成本已给定，无额外容量约束。橙线需求、蓝线MC；利润=P×Q−MC×Q−F。`,`Teaching demand Q=(${a}−P)/${b}, constant MC, given fixed cost and no extra capacity constraint. Orange=demand, blue=MC; profit=P×Q−MC×Q−F.`);
  }else if(id==='membership'){
   const m=membership(p.unit,p.fee);html=svg(line(55,30,55,285,'#9c9086',1)+line(55,285,505,285,'#9c9086',1)+`<polygon points="55,45 55,${285-p.unit*12} ${55+(20-p.unit)*22},${285-p.unit*12}" fill="#f6b96d" opacity=".55"/>`+line(55,45,495,285)+line(55,285-p.unit*12,495,285-p.unit*12,'#355d85',2)+text(15,30,'P')+text(510,313,'Q'),I('单位付费后的消费者剩余三角形，用于检验会员费。','Consumer surplus after usage payments, used to test the access fee.'));
   summary=I(`付单位价后剩余=${f(m.surplus)}；${m.joins?'加入':'不加入'}；实际用量=${f(m.quantity)}；企业利润=${f(m.profit)}`,`Surplus after usage payments=${f(m.surplus)}; ${m.joins?'joins':'does not join'}; actual usage=${f(m.quantity)}; firm profit=${f(m.profit)}`);
   assumptions=I('单个同质顾客P=20−Q，MC=4，无固定成本与其他选择；费等于剩余时假定加入。未加入时图示仍是潜在剩余，实际用量为0。','One representative consumer P=20−Q, MC=4, no fixed costs or outside alternative; ties join. If not joining, the chart still shows potential surplus, but actual usage is zero.');
  }else if(id==='bundle'){
   const m=bundle(p.separate,p.package,p.cost);html=`<table><caption>${I('两位顾客的支付意愿','Two customers’ willingness to pay')}</caption><thead><tr><th>${I('顾客','Buyer')}</th><th>A</th><th>B</th><th>A+B</th></tr></thead><tbody><tr><th>1</th><td>14</td><td>6</td><td>20</td></tr><tr><th>2</th><td>6</td><td>14</td><td>20</td></tr></tbody></table>`;
   summary=I(`单卖利润=${f(m.separateProfit)}；纯套餐利润=${f(m.bundleProfit)}`,`Separate profit=${f(m.separateProfit)}; pure bundle profit=${f(m.bundleProfit)}`);
   assumptions=I('两位顾客、每品至多一件、估值可相加、无固定成本，净收益为0时购买。比较两个指定策略，不自动寻找最优价，也不是混合捆绑。','Two customers, at most one of each item, additive values, no fixed cost, and zero-surplus buyers purchase. Compares specified separate and pure-bundle strategies, not a price optimizer or mixed bundling.');
  }else if(id==='matrix'){
   const games={pd:[[[8,8],[1,12]],[[12,1],[3,3]]],coordination:[[[4,4],[0,0]],[[0,0],[3,3]]],pennies:[[[1,-1],[-1,1]],[[-1,1],[1,-1]]]},values=games[p.game],cells=bestResponses(values),labels=p.game==='pd'?[I('高价','High'),I('低价','Low')]:['A','B'];
   html=`<table class="payoffs"><caption>${I('收益顺序：行玩家、列玩家。先自己找最佳反应。','Payoffs: row player, column player. Find best responses first.')}</caption><thead><tr><th>${I('行 / 列','Row / column')}</th>${labels.map(l=>`<th>${l}</th>`).join('')}</tr></thead><tbody>${[0,1].map(r=>`<tr><th>${labels[r]}</th>${[0,1].map(c=>{const cell=cells.find(x=>x.r===r&&x.c===c);return `<td class="${p.reveal&&cell.nash?'nash':''}">${values[r][c].map((v,i)=>`<span class="${p.reveal&&(i===0?cell.row:cell.col)?'best':''}">${v}</span>`).join(', ')}${p.reveal&&cell.nash?' NE':''}</td>`;}).join('')}</tr>`).join('')}</tbody></table><button type="button" data-reveal>${p.reveal?I('隐藏答案','Hide solution'):I('显示最佳反应','Show best responses')}</button>`;
   const ne=cells.filter(c=>c.nash);summary=p.reveal?I(`纯策略NE：${ne.length}个。`,`${ne.length} pure-strategy NE.`):I('固定一列比较第一个数，再固定一行比较第二个数。','Fix a column and compare first payoffs; fix a row and compare second payoffs.');
   if(p.reveal&&p.game==='pennies')summary+=I('没有纯策略NE；此对称零和例子的混合均衡是双方各以0.5选择A/B。',' No pure NE; the mixed equilibrium in this symmetric zero-sum example gives each action probability 0.5.');
   assumptions=I('完整信息、同时行动、固定收益；下划线表示最佳反应，橙底表示双方同时最佳。均衡不是总收益最大化。','Complete information, simultaneous play, fixed payoffs; underlines mark best responses and orange marks mutual best responses. Equilibrium need not maximize joint payoff.');
  }else if(id==='tree'){
   const m=entry(p.fight,p.share),reveal=p.reveal;html=svg(line(65,170,250,65,reveal&&!m.enter?'#ad4518':'#b9ada1',reveal&&!m.enter?5:2)+line(65,170,250,230,reveal&&m.enter?'#ad4518':'#b9ada1',reveal&&m.enter?5:2)+line(250,230,465,165,reveal&&m.enter&&m.response==='fight'?'#ad4518':'#b9ada1',reveal&&m.enter&&m.response==='fight'?5:2)+line(250,230,465,280,reveal&&m.enter&&m.response==='share'?'#ad4518':'#b9ada1',reveal&&m.enter&&m.response==='share'?5:2)+text(25,155,I('进入者','Entrant'))+text(105,80,I('不进入','Out'))+text(105,230,I('进入','Enter'))+text(225,255,I('在位者','Incumbent'))+text(305,170,I('打击','Fight'))+text(305,285,I('容纳','Accommodate'))+text(410,65,'(0, 100)')+text(435,145,`(−20, ${p.fight})`)+text(435,320,`(40, ${p.share})`),I('进入博弈树，收益顺序为进入者、在位者。','Entry game tree; payoffs are entrant, incumbent.'))+`<button type="button" data-reveal>${reveal?I('隐藏倒推','Hide reasoning'):I('从末端倒推','Work backward')}</button>`;
   summary=reveal?I(`在位者选择${m.response==='fight'?'打击':'容纳'}；进入者${m.enter?'进入':'不进入'}。`,`Incumbent chooses ${m.response==='fight'?'fight':'accommodate'}; entrant ${m.enter?'enters':'stays out'}.`):I('先比较在位者的第二项收益，再让进入者预见。','Compare the incumbent’s second payoff, then anticipate the response.');
   assumptions=I('有限完美信息、风险中性。相等时假定在位者容纳。滑杆模拟后续激励变化，未计承诺成本；只有高亮路径是均衡路径。','Finite perfect information, risk neutrality; ties accommodate. Sliders change continuation incentives without commitment cost; only highlighted branches form the equilibrium path.');
  }else if(id==='oligopoly'){
   const m=oligopoly(p.a,p.cost),items=[['Monopoly',m.monopoly],['Cournot',m.cournot],['Stackelberg',m.stackelberg],['Bertrand',m.bertrand]];
   html=svg(items.map(([label,q],i)=>text(10,55+i*66,label)+`<rect x="150" y="${30+i*66}" width="${q/60*330}" height="30" rx="4" fill="${i===2?'#355d85':'#ad4518'}"/>`+text(165+q/60*330,53+i*66,f(q))).join(''),I('相同需求成本基准下四种模型的市场总产量，共用0到60数量刻度。','Total output across four models with common demand and costs; shared quantity scale 0–60.'));
   summary=I(`需求P=${p.a}−Q，MC=${p.cost}；先行者Q=${f(m.leader)}、追随者Q=${f(m.follower)}。`,`Demand P=${p.a}−Q, MC=${p.cost}; leader Q=${f(m.leader)}, follower Q=${f(m.follower)}.`);
   assumptions=I('同质品、恒定相同MC、无固定成本或容量约束。Cournot同时选量，Stackelberg先后承诺量，Bertrand同时选价；条形是总量，不是单家量。竞争机制不同，不能混用。','Homogeneous goods, equal constant MC, no fixed cost or capacity limits. Cournot chooses quantities simultaneously; Stackelberg commits sequentially; Bertrand chooses prices simultaneously. Bars are total market output. Do not mix the mechanisms.');
  }else if(id==='selection'){
   const m=acquisition(p.offer),x=55+p.offer*4.4;html=svg(`<rect x="55" y="115" width="440" height="70" fill="#e9e2d8"/><rect x="55" y="115" width="${p.offer*4.4}" height="70" fill="#f6b96d"/>`+line(x,90,x,215)+text(55,240,'0')+text(455,240,'100')+text(55,60,I('橙色：愿意接受报价的卖家价值范围','Orange: values of sellers accepting the offer'))+text(55,290,p.offer===0?I('没有正概率成交样本','No positive-probability accepted sample'):`E[v | accept] = ${f(m.conditionalSeller)}`),I('报价截断卖家价值分布；总体均值50并非成交后的条件均值。','The offer truncates seller values; population mean 50 is not the conditional mean after acceptance.'));
   summary=p.offer===0?I('报价0：连续分布下成交概率为0，无正概率成交的条件均值。','Offer 0: zero acceptance probability; no positive-probability conditional mean.'):I(`成交率=${f(m.acceptance*100)}%；成交后买家价值=${f(m.conditionalBuyer)}；条件利润=${f(m.conditionalProfit)}；事前期望利润=${f(m.expectedProfit)}`,`Acceptance=${f(m.acceptance*100)}%; conditional buyer value=${f(m.conditionalBuyer)}; conditional profit=${f(m.conditionalProfit)}; ex ante expected profit=${f(m.expectedProfit)}`);
   assumptions=I('卖家v均匀[0,100]，买家价值1.5v，卖家接受v≤报价，风险中性。未计尽调、其他协同或合同安排；不是任何收购都亏损的结论。','Seller v uniform on [0,100], buyer value 1.5v, acceptance v≤offer, risk neutral. No diligence, other synergies or contract redesign; this does not imply all acquisitions lose.');
  }else if(id==='incentive'){
   const m=incentives(p.rate/100,p.metric);html=`<table><caption>${I('员工只追求佣金：比较两种订单','Worker maximizes commission: compare two bids')}</caption><thead><tr><th>${I('订单','Bid')}</th><th>${I('收入','Revenue')}</th><th>${I('成本','Cost')}</th><th>${I('佣金','Pay')}</th></tr></thead><tbody>${m.options.map(o=>`<tr class="${o.id===m.chosen.id?'nash':''}"><th>${o.id==='volume'?I('量大单','Volume'):I('价值单','Value')}</th><td>${o.revenue}</td><td>${o.cost}</td><td>${f(o.pay)}</td></tr>`).join('')}</tbody></table>`;
   summary=I(`员工选择${m.chosen.id==='volume'?'量大单':'价值单'}；佣金=${f(m.chosen.pay)}；企业佣金后利润=${f(m.net)}`,`Worker selects ${m.chosen.id}; commission=${f(m.chosen.pay)}; firm profit after commission=${f(m.net)}`);
   assumptions=I('两种已知方案、固定工资0、无风险和其他努力成本，员工只看佣金。现实需考虑长期质量、成本操纵、风险分担与参与约束。','Two known options, fixed pay 0, no risk or other effort costs; worker values commission only. Real designs need long-run quality, cost manipulation, risk sharing and participation constraints.');
  }else if(id==='location'){
   const m=location(p.left,p.right);html=svg(`<rect x="55" y="105" width="440" height="100" fill="#f6e6c7"/>`+line(55,210,495,210,'#355d85',5)+`<circle cx="${55+p.left*4.4}" cy="145" r="12" fill="#ad4518"/><circle cx="${55+p.right*4.4}" cy="175" r="12" fill="#355d85"/>`+text(55+p.left*4.4-6,120,'A')+text(55+p.right*4.4-6,200,'B')+text(55,255,'0')+text(460,255,'100'),I('固定价格海滩选址，A橙色、B蓝色；纵向错开仅为避免重叠。','Fixed-price beach location, A orange and B blue; vertical separation only avoids overlap.'));
   summary=I(`A份额=${f(m.leftShare*100)}%；B份额=${f(m.rightShare*100)}%。`,`A share=${f(m.leftShare*100)}%; B share=${f(m.rightShare*100)}%.`);
   assumptions=I('客户均匀分布0–100，同价、每人买一份、选最近一家；同位置平分。份额是给定位置下的结果，不自动证明位置均衡或利润最优。','Uniform customers on [0,100], equal fixed prices, one unit each, nearest shop; co-location splits demand. Shares at selected locations do not establish equilibrium or optimal profit.');
  }
  plot.innerHTML=html;result.textContent=summary;note.textContent=assumptions;
  plot.querySelector('[data-reveal]')?.addEventListener('click',()=>{params.reveal=!params.reveal;draw();});
 }
 host.oninput=e=>{if(!e.target.matches('[data-param]'))return;params[e.target.dataset.param]=e.target.tagName==='SELECT'?e.target.value:Number(e.target.value);if(e.target.dataset.param==='game')params.reveal=false;draw();};
 host.querySelector('[data-reset]').addEventListener('click',()=>{memory.delete(memoryKey);mountLab(host,id,lang,context);});
 draw();
}
