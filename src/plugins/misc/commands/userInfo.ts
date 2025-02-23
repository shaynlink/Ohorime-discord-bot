import { Partials, IntentsBitField, EmbedBuilder } from 'discord.js';
import Command from '../../../base/Command';

export default new Command()
  .setMetadata(
    (builder) => builder
      .setName('user-info')
      .setDescription('get some informations about current user')
      .addStringOption((option) => option
        .setName('from')
        .setDescription('What information do you want to get ?')
        .setRequired(true)
        .addChoices(
          { name: 'user', value: 'from_user' },
          { name: 'guild', value: 'from_guild' }
        )
      )
  )
  .setPartials([Partials.Message])
  .setIntents((intents) => intents.add(IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.DirectMessages))
  .setExecutor(async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Your informations !')
      .setDescription(`Here are some informations about you, ${interaction.user.username}#${interaction.user.discriminator} - ${interaction.user.displayName}`)
      .setColor(interaction.user.accentColor ?? '#cb5050');

    if (interaction.options.getString('from') == 'from_user') {
      embed.setThumbnail(interaction.user.avatarURL({ size: 4096, extension: 'png' }));
      embed.addFields([{
        name: 'ID',
        value: interaction.user.id,
        inline: true
      }, {
        name: 'Tag',
        value: `${interaction.user.username}#${interaction.user.discriminator}`,
        inline: true
      }, {
        name: 'Created At',
        value: interaction.user.createdAt.toUTCString(),
        inline: true
      }, {
        name: 'Bot',
        value: interaction.user.bot ? 'Yes' : 'No',
        inline: true
      }, {
        name: 'Legacy tag',
        value: interaction.user.tag,
        inline: true
      }]);
      if (interaction.user.globalName) {
        embed.addFields({
          name: 'Global name',
          value: interaction.user.globalName,
          inline: true
        });
      }

      if (interaction.user.banner) {
        embed.setImage(interaction.user.bannerURL({ size: 4096, extension: 'png' }) as string);
      }
    } else if (interaction.options.getString('from') == 'from_guild') {
      if (!interaction.inGuild()) {
        embed.setDescription('You need to be in a guild to get informations about it');
        return interaction.reply({ embeds: [embed] });
      }

      const member = await interaction.guild?.members.fetch({
        user: interaction.user.id,
        cache: true
      });

      embed.setThumbnail(interaction.user.displayAvatarURL({ size: 4096, extension: 'png' }));
      embed.addFields([{
        name: 'Display Name',
        value: interaction.user.displayName,
        inline: true
      }]);
      
      if (member) {
        embed.addFields([{
          name: 'Joined At',
          value: member.joinedAt?.toUTCString() ?? 'Unknown',
          inline: true
        }, {
          name: 'Roles',
          value: member.roles.cache.map((role) => role.toString()).join(', '),
          inline: true
        }]);
      }
    }

    interaction.reply({ embeds: [embed] });
  });