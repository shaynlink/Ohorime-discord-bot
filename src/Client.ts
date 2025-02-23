import { readdir } from 'node:fs/promises';
import { resolve, join, } from 'node:path';
import {
  Client as DiscordClient,
  Collection,
  Routes,
  IntentsBitField
} from 'discord.js';
import { MongoClient, type Db } from 'mongodb';
import { createClient } from 'redis';
import _ from 'lodash';
import chalk from 'chalk';
import type BasePlugin from './base/Plugin';
import { listOnlyFiles } from './helpers/utils';
import config from '../config.json' with { type: 'json' };

// Events
import debug from './events/debug';
import ready from './events/ready';
import interactionCreate from './events/interactionCreate';

const __dirname = resolve(import.meta.dirname);

export default class Client<Ready extends boolean = boolean> extends DiscordClient<Ready> {
  public readonly plugins: Collection<string, BasePlugin>;
  public readonly mongo: MongoClient;
  public readonly redis: ReturnType<typeof createClient>;
  public readonly db: Db;

  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
      ]
    });

    this.plugins = new Collection();

    this.mongo = new MongoClient(process.env.MONGO_URI as string ?? 'mongodb://internal:27017');
    this.redis = createClient({
      url: process.env.REDIS_URI as string ?? 'redis://internal:6379',
      socket: {
        reconnectStrategy(retries) {
          const jitter = Math.floor(Math.random() * 200);
          const delay = Math.min(Math.pow(2, retries) * 50, 2000);

          return delay + jitter;
        }
      }
    });

    this.db = this.mongo.db('bot-discord');

    this.on('debug', debug);
    this.on('ready', () => ready(this as Client<true>));
    this.on('interactionCreate', (interaction) => interactionCreate(this as Client<true>, interaction));
  }

  async loadPlugins() {
    const plugins = await readdir(resolve(join(__dirname, 'plugins')));

    for (const index in plugins) {
      console.log('Loading plugin %s', chalk.yellow(plugins[index]));
      const pluginFile = plugins[index];
      
      const files = await listOnlyFiles(resolve(join(__dirname, 'plugins', pluginFile)));

      const rootFile = files.find((file) => file === 'index.ts' || file === 'index.js');

      if (!rootFile) continue;

      let { default: plugin } = await import(resolve(join(__dirname, 'plugins', pluginFile, rootFile)));
      
      if (!plugin.isInstancied) {
        plugin = new plugin(this);
        await plugin.onMount();
      }
      this.plugins.set(plugin.name, plugin);
      this.options.intents.add(plugin.intents);
      this.options.partials = _.union(this.options.partials, plugin.partials);
      console.log(
        'Plugin %s loaded succesfully with [commands: %s, events: %s]',
        chalk.green(plugins[index]),
        chalk.yellow(plugin.commands.size),
        chalk.yellow(plugin.events.size)
      );
    }

    const events = this.plugins.reduce((acc, plugin) => {
      plugin.events.forEach((event, name) => {
        acc[name] ??= [];
        acc[name].push(event);
      })

      return acc;
    }, {} as Record<string, ((...args: any[]) => any)[]>);

    Object.entries(events).forEach(([name, callbacks]) => {
      this.on(name as keyof Client, (...args) => callbacks.forEach((callback) => callback(this, ...args)));
    })
  }

  async registerCommands() {
    const commands = this.plugins.toJSON().flatMap((plugin) => plugin.exportPublicCommandAPI());

    commands.forEach((command) => console.log('Registering command %s', chalk.yellow(command.name)));

    // await this.rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID as string), { body: commands });
    await this.rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID as string, config.adminGuildId), { body: commands });
  }

  getCommandByName(name: string) {
    return this.plugins.flatMap((plugin) => plugin.commands).find((command) => command.metadata.name === name);
  }

  async gracefullShutdown() {
    await this.destroy();
    console.log('Disconnecting from MongoDB...');
    await this.mongo.close();
    console.log('Gracefully shutdown !');
  }
}