import type { Message } from 'discord.js';
import type Client from '../../../Client';
import type LevelingPlugin from '../index';

export default async function messageCreate(this: LevelingPlugin, client: Client, message: Message) {
  if (message.author.bot || message.author.system) return;
  if (message.guildId === null) return;

  await this.statsColl.findOneAndUpdate(
    { userId: message.author.id, guildId: message.guildId },
    { $inc: { nbMessages: 1 } },
    { upsert: true  }
  );
}