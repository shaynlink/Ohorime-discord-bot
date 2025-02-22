import { Partials, IntentsBitField, EmbedBuilder } from 'discord.js';
import Command from '../../../base/Command';

export default new Command()
  .setMetadata(
    (builder) => builder
      .setName('ping')
      .setDescription('Ping the bot')
  )
  .setPartials([Partials.Message])
  .setIntents((intents) => intents.add(IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.DirectMessages))
  .setExecutor((client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('Pong !')
      .setDescription(`Latency: ${Date.now() - interaction.createdTimestamp}ms`)
      .addFields([{
        name: 'API Latency',
        value: `${Math.round(client.ws.ping)}ms`,
        inline: true
      }, {
        name: 'Uptime',
        value: `${Math.round(process.uptime())}s`,
        inline: true
      }, {
        name: 'Memory Usage',
        value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        inline: true
      }, {
        name: 'Node.js Version',
        value: process.version,
        inline: true
      }])
      .setColor('#cb5050');
    
      interaction.reply({ embeds: [embed] });
  });