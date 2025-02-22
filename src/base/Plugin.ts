import { ClientEvents, Collection, IntentsBitField, Partials } from 'discord.js';
import _ from 'lodash';
import type Client from '../Client';
import type Command from '../base/Command';

export default class PluginBase {
  public name: string;
  public description: string;
  public commands: Collection<string, Command>;
  public events: Collection<keyof ClientEvents, (client: Client, ...args: ClientEvents[keyof ClientEvents]) => any>;
  public intents: IntentsBitField;
  public partials: Partials[];
  public guildOnly: boolean;
  public isInstancied: boolean;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.commands = new Collection();
    this.events = new Collection();
    this.intents = new IntentsBitField(0);
    this.partials = [];
    this.guildOnly = false;
    this.isInstancied = true;
  }

  setGuildOnly() {
    this.guildOnly = true;
    return this;
  }

  addCommand(command: Command) {
    this.commands.set(command.metadata.name, command);
    this.intents.add(command.intents);
    this.partials = _.union(this.partials, command.partials);
    return this;
  }

  addEvent<Evt extends keyof ClientEvents>(name: Evt, callback: (client: Client, ...args: [...ClientEvents[Evt]]) => void, options?: { intents?: IntentsBitField, partials?: Partials[] }) {
    this.events.set(name, callback.bind(this) as (...args: any[]) => any);
    if (options?.intents) {
      this.intents.add(...options.intents);
    }
    if (options?.partials) {
      this.partials = _.union(this.partials, options.partials);
    }
    return this;
  }

  exportPublicCommandAPI() {
    return this.commands.map((command) => command.metadata.toJSON());
  }
}