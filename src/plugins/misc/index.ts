import PluginBase from '../../base/Plugin';

// Commands
import userInfo from './commands/userInfo';

export default new PluginBase('Misc', 'Miscellaneous plugin')
  .addCommand(userInfo)
