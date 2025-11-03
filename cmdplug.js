var commands = [];

function cmd(config, func) {
  config.dontAddCommandList = config.dontAddCommandList || false;
  config.fromMe = config.fromMe || false;
  config.desc = config.desc || '';
  config.category = config.category || 'misc';
  config.filename = config.filename || 'Not Provided';
  config.function = func;

  if (!config.dontAddCommandList) {
    commands.push(config);
  }

  return config;
}

module.exports = {
  cmd,
  AddCommand: cmd,
  Function: cmd,
  Module: cmd,
  commands
};
