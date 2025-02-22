import {
  Partials,
  IntentsBitField,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder
} from 'discord.js';
import Command from '../../../base/Command';
import PluginBase from '../../../base/Plugin';

export default new Command()
  .setMetadata(
    (builder) => builder
      .setName('help')
      .setDescription('Display the help message')
  )
  .setPartials([Partials.Message])
  .setIntents((intents) => intents.add(IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.DirectMessages))
  .setExecutor((client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Help')
      .setDescription('Here is the list of available commands')
      .setColor('#cb5050');

    const select = new StringSelectMenuBuilder()
      .setCustomId('select-menu-help')
      .setPlaceholder('Select a plugin !')
      .addOptions(
        ...client.plugins.map((plugin) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(plugin.name)
            .setDescription(plugin.description)
            .setValue(plugin.name)
        )
      );  

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(select);

    interaction.reply({
      embeds: [embed],
      components: [row]
    });
  })
  .setSelectMenu('select-menu-help', async (client, interaction) => {
    const pluginName = interaction.values.shift();
    
    if (!pluginName || !client.plugins.has(pluginName)) return;

    const plugin = (client.plugins
      .get(pluginName) as PluginBase);


    const embed = new EmbedBuilder()
      .setTitle(`Help - ${plugin.name} plugin`)
      .setDescription(`Here is the list of available commands:\n${plugin.description}`)
      .setColor('#cb5050')
      .addFields(
        ...plugin.commands.map((command) => ({
          name: command.metadata.name,
          value: command.metadata.description,
          inline: true
        }))
      )

    interaction.reply({
      embeds: [embed]
    });
  });