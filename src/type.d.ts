import { BaseInteraction, ChatInputCommandInteraction } from 'discord.js';
import type Client from './Client';
import PluginBase from './base/Plugin';
import Command from './base/Command';

export type CommandExecutorFn<T extends BaseInteraction = ChatInputCommandInteraction> = (client: Client<true>, interaction: T) => void;

export interface CommandBinding {
  command: Command;
  plugin: PluginBase;
}