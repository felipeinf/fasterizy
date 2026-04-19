const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');
const {
  REPO_SLUG,
  packageRoot,
} = require('./common');
const { installClaudeCode, installCodex } = require('./install-hooks');

const CHOICES = [
  { value: 'opencode', label: 'OpenCode (npx skills)' },
  { value: 'openclaw', label: 'OpenClaw (npx skills)' },
  { value: 'cursor', label: 'Cursor (npx skills)' },
  { value: 'antigravity', label: 'Antigravity (npx skills)' },
  { value: 'claude-code', label: 'Claude Code (hooks in ~/.claude)' },
  { value: 'codex', label: 'Codex (hooks in ~/.codex)' },
  { value: 'windsurf', label: 'Windsurf (npx skills)' },
  { value: 'cline', label: 'Cline (npx skills)' },
  { value: 'copilot', label: 'GitHub Copilot (npx skills)' },
];

function parseAgentsFlag(argv) {
  const i = argv.indexOf('--agents');
  if (i === -1 || !argv[i + 1]) return null;
  return argv[i + 1]
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function npxSkillsAdd(npxFlag) {
  const r = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['skills', 'add', REPO_SLUG, '-a', npxFlag],
    { stdio: 'inherit', shell: process.platform === 'win32' }
  );
  return r.status === 0;
}

module.exports = async function install(argv) {
  const pkg = packageRoot();
  let selected = parseAgentsFlag(argv);

  if (!selected || selected.length === 0) {
    const { checkbox } = await import('@inquirer/prompts');
    selected = await checkbox({
      message: 'Select where to install fasterizy',
      choices: CHOICES.map((c) => ({ name: c.label, value: c.value })),
      required: true,
    });
  }

  console.log('');

  for (const id of selected) {
    try {
      if (id === 'opencode') {
        npxSkillsAdd('opencode');
      } else if (id === 'openclaw') {
        npxSkillsAdd('openclaw');
      } else if (id === 'cursor') {
        npxSkillsAdd('cursor');
      } else if (id === 'antigravity') {
        npxSkillsAdd('antigravity');
      } else if (id === 'claude-code') {
        const r = installClaudeCode(pkg);
        const cd = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
        console.log('Claude Code: hooks installed at', path.join(cd, 'hooks'));
        if (r.backup) console.log('  backup:', r.backup);
        console.log(
          '  Optional in Claude Code: /plugin marketplace add ' + REPO_SLUG + ' then /plugin install fasterizy'
        );
      } else if (id === 'codex') {
        const r = installCodex(pkg);
        const cx = process.env.CODEX_CONFIG_DIR || path.join(os.homedir(), '.codex');
        console.log('Codex: hooks installed at', path.join(cx, 'hooks') + ', hooks.json patched');
        if (r.backup) console.log('  backup:', r.backup);
      } else if (id === 'windsurf') {
        npxSkillsAdd('windsurf');
      } else if (id === 'cline') {
        npxSkillsAdd('cline');
      } else if (id === 'copilot') {
        npxSkillsAdd('github-copilot');
      } else {
        console.warn('Unknown agent:', id);
      }
    } catch (e) {
      console.error('Error installing', id + ':', e.message || e);
    }
  }

  console.log('');
  console.log('Restart Claude Code / Codex after hook changes.');
};
