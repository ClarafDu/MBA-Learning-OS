export const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
export const variance=(a,sample=false)=>{const m=mean(a);return a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-(sample?1:0));};
// Abramowitz–Stegun normal CDF approximation; absolute error below 8e-8.
export function normalCDF(x){if(x===0)return .5;const a=Math.abs(x),t=1/(1+.2316419*a),d=Math.exp(-a*a/2)/Math.sqrt(2*Math.PI);const p=1-d*t*(.319381530+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return x<0?1-p:p;}
export function binomial(n,p){if(p===0)return Array.from({length:n+1},(_,k)=>k===0?1:0);if(p===1)return Array.from({length:n+1},(_,k)=>k===n?1:0);const out=[(1-p)**n];for(let k=1;k<=n;k++)out.push(out[k-1]*(n-k+1)/k*p/(1-p));return out;}
export function seeded(seed=2809){return ()=>{seed=(1664525*seed+1013904223)>>>0;return (seed+.5)/4294967296;};}
export function sampleMeans(n,reps=300,seed=2809){const random=seeded(seed);return Array.from({length:reps},()=>{let sum=0;for(let j=0;j<n;j++)sum+=-Math.log(1-random());return sum/n;});}
export function normalRandom(random){return Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random());}
export function confidenceIntervals(n=25,z=1.96,reps=80,seed=41){const random=seeded(seed),se=10/Math.sqrt(n);return Array.from({length:reps},()=>{const estimate=50+se*normalRandom(random),lo=estimate-z*se,hi=estimate+z*se;return {estimate,lo,hi,covers:lo<=50&&hi>=50};});}
export const bayes=(prior,sensitivity,falsePositive)=>{const truePositive=prior*sensitivity,falseAlarm=(1-prior)*falsePositive;return {truePositive,falseAlarm,positive:truePositive+falseAlarm,posterior:truePositive/(truePositive+falseAlarm)};};
export const combinedVariance=(sx,sy,rho)=>sx*sx+sy*sy+2*rho*sx*sy;
export function testP(z,tail='two'){return tail==='left'?normalCDF(z):tail==='right'?1-normalCDF(z):Math.min(1,2*(1-normalCDF(Math.abs(z))));}
