// Explicit, deterministic teaching models. Currency and quantity use example units.
export function market(a=100,b=2,c=10,d=1,tax=0){
 const quantity=Math.max(0,(a-c-tax)/(b+d));
 return {quantity,buyerPrice:a-b*quantity,sellerPrice:c+d*quantity};
}
export function pricing(a=100,b=2,cost=10,fixed=100,price=30){
 const quantity=Math.max(0,(a-price)/b),revenue=price*quantity;
 return {quantity,revenue,profit:revenue-cost*quantity-fixed,optimalQuantity:Math.max(0,(a-cost)/(2*b)),optimalPrice:(a+cost)/2};
}
export function welfare(a,b,c,d,tax=0){
 const m=market(a,b,c,d,tax),base=market(a,b,c,d);
 const cs=.5*b*m.quantity**2,ps=.5*d*m.quantity**2,revenue=tax*m.quantity;
 return {...m,cs,ps,revenue,loss:.5*tax*(base.quantity-m.quantity),total:cs+ps+revenue};
}
export function membership(unit=4,fee=80){
 const quantity=Math.max(0,20-unit),surplus=.5*quantity**2;
 const joins=fee<=surplus;
 return {quantity:joins?quantity:0,surplus,joins,profit:joins?fee+(unit-4)*quantity:0};
}
// Two equally sized customer groups; values (A,B) are (14,6) and (6,14).
export function bundle(separate=10,packagePrice=18,cost=2){
 const groups=[[14,6],[6,14]];
 return {separateProfit:groups.reduce((s,values)=>s+values.reduce((v,w)=>v+(w>=separate?separate-cost:0),0),0),bundleProfit:groups.reduce((s,values)=>s+(values[0]+values[1]>=packagePrice?packagePrice-2*cost:0),0)};
}
export function bestResponses(payoffs){
 const cells=[];
 for(let r=0;r<2;r++)for(let c=0;c<2;c++){
  const row=payoffs[r][c][0]>=payoffs[1-r][c][0],col=payoffs[r][c][1]>=payoffs[r][1-c][1];
  cells.push({r,c,row,col,nash:row&&col});
 }
 return cells;
}
export function entry(fight=-20,share=40){
 const response=fight>share?'fight':'share';
 const payoff=response==='fight'?-20:40;
 return {response,enter:payoff>0,payoff};
}
export function oligopoly(a=30,c=6){
 const spread=Math.max(0,a-c);
 return {monopoly:spread/2,cournot:2*spread/3,stackelberg:3*spread/4,bertrand:spread,leader:spread/2,follower:spread/4};
}
export function acquisition(offer=60){
 // Seller value is uniform on [0,100]; buyer adds 50% value.
 const acceptance=Math.min(1,Math.max(0,offer/100)),conditionalSeller=Math.min(100,Math.max(0,offer))/2;
 const conditionalBuyer=1.5*conditionalSeller;
 return {acceptance,conditionalSeller,conditionalBuyer,conditionalProfit:conditionalBuyer-offer,expectedProfit:acceptance*(conditionalBuyer-offer)};
}
export function incentives(rate=.1,metric='revenue'){
 // Two available bids: volume (revenue 100,cost 90), value (80,50).
 const options=[{id:'volume',revenue:100,cost:90},{id:'value',revenue:80,cost:50}].map(o=>({...o,profit:o.revenue-o.cost,pay:rate*(metric==='revenue'?o.revenue:o.revenue-o.cost)}));
 const chosen=options.reduce((a,b)=>a.pay>=b.pay?a:b);
 return {options,chosen,net:chosen.profit-chosen.pay};
}
export function location(left=25,right=75){
 if(left===right)return {leftShare:.5,rightShare:.5};
 const boundary=(left+right)/2/100;
 return left<right?{leftShare:boundary,rightShare:1-boundary}:{leftShare:1-boundary,rightShare:boundary};
}
