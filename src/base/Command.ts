import {
  IntentsBitField,
  Partials,
  SlashCommandBuilder,
  type StringSelectMenuInteraction,
} from 'discord.js';
import _ from 'lodash';
import type { CommandExecutorFn } from '../type';

export default class Command {
  public metadata: SlashCommandBuilder;
  public partials: Partials[];
  public intents: IntentsBitField;
  public executor: CommandExecutorFn | null;
  public uniqueGuildId: string | null;
  public selectMenus: Array<{ id: string, callback: CommandExecutorFn<StringSelectMenuInteraction> }>;

  constructor() {
    this.metadata = new SlashCommandBuilder();
    this.partials = [];
    this.intents = new IntentsBitField();
    this.executor = null;
    this.uniqueGuildId = null;
    this.selectMenus = [];
  }

  setMetadata(callback: (builder: SlashCommandBuilder) => void) {
    callback(this.metadata);
    return this;
  }

  setPartials(partials: Partials[]) {
    this.partials = _.union(this.partials, partials);
    return this;
  }

  setIntents(callback: (intents: IntentsBitField) => void) {
    callback(this.intents);
    return this;
  }

  setExecutor(callback: CommandExecutorFn) {
    this.executor = callback;
    return this;
  }
  
  forUniqueGuild(guildId: string) {
    this.uniqueGuildId = guildId;
    return this;
  }

  setSelectMenu(id: string, callback: CommandExecutorFn<StringSelectMenuInteraction>) {
    this.selectMenus.push({ id, callback });
    return this;
  }
}