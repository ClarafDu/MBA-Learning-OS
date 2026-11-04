export const utilityRoutes=['map','continue','review','notes','connections','practice','glossary'];
export function accountingHref(route='map',root='/accounting/'){
  return root+(route==='map'?'':route.replace(/^#|\/$/g,'')+'/');
}
export function accountingRoute(pathname,root='/accounting/'){
  if(pathname===root.slice(0,-1)||pathname===root)return '#map';
  if(!pathname.startsWith(root))return '#map';
  return '#'+pathname.slice(root.length).replace(/\/$/,'');
}
