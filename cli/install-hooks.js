const fs = require('fs');
const path = require('path');
const os = require('os');

const HOOK_FILES = ['package.json', 'flag.js', 'skill-content.js', 'activate.js', 'tracker.js'];

function patchClaudeSettings(settingsPath, hooksDir) {
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {
    throw new Error('settings.json: ' + e.message);
  }
  if (!settings.hooks) settings.hooks = {};

  const hasFz = (event) =>
    Array.isArray(settings.hooks[event]) &&
    settings.hooks[event].some((e) =>
      e.hooks && e.hooks.some((h) => h.command && h.command.toLowerCase().includes('fasterizy'))
    );

  const act = 'FASTERIZY=1 node "' + hooksDir + '/activate.js"';
  const trk = 'FASTERIZY=1 node "' + hooksDir + '/tracker.js"';

  if (!hasFz('SessionStart')) {
    if (!settings.hooks.SessionStart) settings.hooks.SessionStart = [];
    settings.hooks.SessionStart.push({
      hooks: [
        {
          type: 'command',
          command: act,
          timeout: 5,
          statusMessage: 'Loading fasterizy...',
        },
      ],
    });
  }
  if (!hasFz('UserPromptSubmit')) {
    if (!settings.hooks.UserPromptSubmit) settings.hooks.UserPromptSubmit = [];
    settings.hooks.UserPromptSubmit.push({
      hooks: [
        {
          type: 'command',
          command: trk,
          timeout: 5,
          statusMessage: 'Tracking fasterizy...',
        },
      ],
    });
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

function patchCodexHooksJson(hooksJsonPath, hooksDir) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(hooksJsonPath, 'utf8'));
  } catch (e) {
    throw new Error('hooks.json: ' + e.message);
  }
  if (!data.hooks) data.hooks = {};

  const hasFz = (event) => {
    const arr = data.hooks[event];
    if (!Array.isArray(arr)) return false;
    return arr.some(
      (g) =>
        g.hooks &&
        g.hooks.some((h) => h.command && h.command.toLowerCase().includes('fasterizy'))
    );
  };

  const act = 'FASTERIZY=1 node "' + hooksDir + '/activate.js"';
  const trk = 'FASTERIZY=1 node "' + hooksDir + '/tracker.js"';

  if (!hasFz('SessionStart')) {
    if (!data.hooks.SessionStart) data.hooks.SessionStart = [];
    data.hooks.SessionStart.push({
      matcher: 'startup|resume',
      hooks: [
        {
          type: 'command',
          command: act,
          timeout: 5,
          statusMessage: 'Loading fasterizy',
        },
      ],
    });
  }
  if (!hasFz('UserPromptSubmit')) {
    if (!data.hooks.UserPromptSubmit) data.hooks.UserPromptSubmit = [];
    data.hooks.UserPromptSubmit.push({
      hooks: [
        {
          type: 'command',
          command: trk,
          timeout: 5,
          statusMessage: 'Tracking fasterizy',
        },
      ],
    });
  }
  fs.writeFileSync(hooksJsonPath, JSON.stringify(data, null, 2) + '\n');
}

function copyHooks(packageHooksDir, targetHooksDir) {
  for (const f of HOOK_FILES) {
    const src = path.join(packageHooksDir, f);
    const dst = path.join(targetHooksDir, f);
    fs.copyFileSync(src, dst);
  }
}

function installClaudeCode(packageRoot) {
  const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  const hooksDir = path.join(claudeDir, 'hooks');
  const packageHooksDir = path.join(packageRoot, 'hooks');

  fs.mkdirSync(hooksDir, { recursive: true });
  if (!fs.existsSync(packageHooksDir)) {
    throw new Error('hooks not found in package: ' + packageHooksDir);
  }
  copyHooks(packageHooksDir, hooksDir);

  const settings = path.join(claudeDir, 'settings.json');
  if (fs.existsSync(settings)) {
    fs.copyFileSync(settings, settings + '.bak');
  } else {
    fs.writeFileSync(settings, '{}\n');
  }
  patchClaudeSettings(settings, hooksDir);
  return { ok: true, backup: fs.existsSync(settings + '.bak') ? settings + '.bak' : null };
}

function ensureCodexConfigToml(codexDir) {
  const cfg = path.join(codexDir, 'config.toml');
  if (!fs.existsSync(cfg)) {
    fs.writeFileSync(cfg, '[features]\ncodex_hooks = true\n');
    return;
  }
  const raw = fs.readFileSync(cfg, 'utf8');
  if (!raw.includes('codex_hooks')) {
    fs.appendFileSync(cfg, '\n[features]\ncodex_hooks = true\n');
  }
}

function installCodex(packageRoot) {
  const codexDir = process.env.CODEX_CONFIG_DIR || path.join(os.homedir(), '.codex');
  const hooksDir = path.join(codexDir, 'hooks');
  const packageHooksDir = path.join(packageRoot, 'hooks');

  fs.mkdirSync(hooksDir, { recursive: true });
  if (!fs.existsSync(packageHooksDir)) {
    throw new Error('hooks not found in package: ' + packageHooksDir);
  }
  copyHooks(packageHooksDir, hooksDir);

  ensureCodexConfigToml(codexDir);

  const hooksJson = path.join(codexDir, 'hooks.json');
  if (fs.existsSync(hooksJson)) {
    fs.copyFileSync(hooksJson, hooksJson + '.bak');
  } else {
    fs.writeFileSync(hooksJson, '{}\n');
  }
  patchCodexHooksJson(hooksJson, hooksDir);
  return { ok: true, backup: fs.existsSync(hooksJson + '.bak') ? hooksJson + '.bak' : null };
}

module.exports = {
  installClaudeCode,
  installCodex,
  HOOK_FILES,
};
