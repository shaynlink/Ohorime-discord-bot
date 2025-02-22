import { Partials, IntentsBitField, AttachmentBuilder } from 'discord.js';
import { request } from 'undici';
import type { WithId } from 'mongodb';
import Command from '../../../base/Command';
import { getLevelInfo } from '../helpers/leveling';
import type LevelPlugin from '..';
import type { Stats } from '../struct';
import generateImage from '../workers/generate-level-img';

export default new Command()
  .setMetadata(
    (builder) => builder
      .setName('xp')
      .setDescription('Display your current xp')
  )
  .setPartials([Partials.Message])
  .setIntents((intents) => intents.add(IntentsBitField.Flags.GuildMessages))
  .setExecutor(async function(this: LevelPlugin, client, interaction) {
    if (!interaction.inGuild()) return;

    let xp: Partial<WithId<Stats>> | null = await this.statsColl.findOne({ userId: interaction.user.id, guildId: interaction.guildId });

    let replied = false;

    if (!xp) {
      await interaction.reply('You haven\'t not experience points yet');
      replied = true;
      await this.statsColl.insertOne({ userId: interaction.user.id, guildId: interaction.guildId, nbMessages: 0 });

      xp = {
        nbMessages: 0
      }
    }

    const leveling = getLevelInfo(xp?.nbMessages ?? 0, 50);

    const { body } = await request(interaction.user.displayAvatarURL({ extension: 'png', size: 512 }))

    const buffer = Buffer.from(await body.arrayBuffer());

    const image = await generateImage(
      interaction.user.username,
      buffer
    );

    console.log(image);

    const attachment = new AttachmentBuilder(image, { name: `level-${interaction.user.id}.png` });

    if (!replied) {
      await interaction.reply({
        content: `You have ${xp.nbMessages} messages and you are level ${leveling.level} with ${leveling.xp} xp`,
        files: [attachment]
      });
    } else {
      await interaction.followUp({
        content: `You have ${xp.nbMessages} messages and you are level ${leveling.level} with ${leveling.xp} xp`,
        files: [attachment]
      })
    }
  })