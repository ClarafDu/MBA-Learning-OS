export function githubBase(env=process.env) {
  if(env.GITHUB_PAGES!=='true')return '';
  if(env.PAGES_BASE_PATH!==undefined)return env.PAGES_BASE_PATH.replace(/\/$/,'');
  const repo=env.GITHUB_REPOSITORY?.split('/')[1]||'';
  return repo && !repo.toLowerCase().endsWith('.github.io') ? '/'+repo : '';
}
