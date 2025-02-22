import PluginBase from '../../base/Plugin';

// Commands
import ping from './commands/ping';
import help from './commands/help';

export default new PluginBase('default', 'Default plugin')
  .addCommand(ping)
  .addCommand(help)