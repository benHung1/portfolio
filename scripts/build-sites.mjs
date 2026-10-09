import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
const result=spawnSync(process.execPath,['--import','./scripts/windows-build-retry.mjs','./node_modules/@nuxt/cli/bin/nuxi.mjs','build'],{stdio:'inherit',env:{...process.env,PORTFOLIO_SITES_BUILD:'1',PORTFOLIO_BUILD_DIR:'.nuxt-hosting'}});
if(result.status!==0) process.exit(result.status||1);
if(!existsSync('dist/server/index.js')) throw new Error('Sites Worker entry is missing');
mkdirSync('dist/.openai',{recursive:true});
copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
const audit=spawnSync(process.execPath,['scripts/audit-release.mjs'],{stdio:'inherit'});
process.exit(audit.status||0);
