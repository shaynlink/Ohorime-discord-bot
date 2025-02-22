import { BaseInteraction, ChatInputCommandInteraction } from 'discord.js';
import type Client from './Client';

export type CommandExecutorFn<T extends BaseInteraction = ChatInputCommandInteraction> = (client: Client<true>, interaction: T) => void;