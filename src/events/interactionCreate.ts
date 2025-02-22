import type { Interaction, ChatInputCommandInteraction } from 'discord.js';
import type Client from '../Client';

export default function interactionCreate(client: Client<true>, interaction: Interaction) {
  if (interaction.isCommand()) {
    const command = client.plugins.flatMap((plugin) => plugin.commands).find((command) => command.metadata.name === interaction.commandName);
  
    if (!command || !command.executor) return interaction.reply({ content: 'Command not found', ephemeral: true });
  
    command.executor(client, interaction as ChatInputCommandInteraction);
    return;
  }
  
  if (interaction.isStringSelectMenu()) {
    const commands = client.plugins
      .flatMap((plugin) => plugin.commands)
      .map((command) => command.selectMenus)
      .flat()
      .filter((selectMenu) => selectMenu.id === interaction.customId)

    commands.forEach(({ callback }) => callback(client, interaction));
    return;
  }
}