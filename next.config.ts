import type { NextConfig } from 'next';
import { githubBase } from './scripts/github-base.mjs';
const basePath=githubBase();
const nextConfig: NextConfig={
 output:process.env.GITHUB_PAGES==='true'?'export':undefined,
 basePath,
 trailingSlash:true,
 images:{unoptimized:true},
 turbopack:{root:process.cwd()},
};
export default nextConfig;
