import { IntentsBitField, Partials } from 'discord.js';
import type { Collection } from 'mongodb';
import PluginBase from '../../base/Plugin';
import type Client from '../../Client';
import type { Stats } from './struct';

// Commands
import xp from './commands/xp';

// Events
import messageCreate from './events/messageCreate';

export default class extends PluginBase {
  public readonly client: Client;
  public readonly statsColl: Collection<Stats>;

  constructor(client: Client) {
    super('leveling', 'Leveling plugin');
    this.client = client;

    this.statsColl = this.client.db.collection<Stats>('stats');

    super
      .setGuildOnly()
      .addEvent('messageCreate', messageCreate, {
        intents: new IntentsBitField()
          .add(IntentsBitField.Flags.GuildMessages),
        partials: [Partials.Message]
      })
      .addCommand(xp);
  }

  async onMount() {
    await this.statsColl.createIndex({ userId: 1, guildId: 1 }, { unique: true });

    return this;
  }
}
 