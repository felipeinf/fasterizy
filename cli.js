#!/usr/bin/env node

const path = require('path');

const { enable, disable } = require('./hooks/flag');

function showHelp() {
  console.log(`fasterizy — direct prose for agent planning and docs

Usage:
  npx fasterizy install    Interactive multi-agent install
  npx fasterizy install --agents opencode,openclaw,cursor
  npx fasterizy update     Refresh npx-skills installs from GitHub; print plugin update hints
  npx fasterizy start      Enable runtime flag (~/.claude/.fasterizy-active)
  npx fasterizy stop       Disable runtime flag
  npx fasterizy status     Flag state, version, detected installs
`);
}

async function main() {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);

  switch (cmd) {
    case 'install':
      await require('./cli/install')(args);
      break;
    case 'update':
      require('./cli/update')();
      break;
    case 'start':
      enable();
      console.log('fasterizy: ON');
      break;
    case 'stop':
      disable();
      console.log('fasterizy: OFF');
      break;
    case 'status':
      require('./cli/status')();
      break;
    case '-h':
    case '--help':
    case undefined:
      showHelp();
      process.exit(cmd === undefined ? 1 : 0);
      break;
    default:
      console.error('Unknown command:', cmd);
      showHelp();
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
