import 'dotenv/config';
import process from 'node:process';
import Client from './Client';

const client = new Client();

client.mongo.on('open', () => console.log('MongoDB pool opened !'));

async function bootstrap() {
  console.log('Booting up...');

  await client.loadPlugins();

  console.log('%s plugins loaded!', client.plugins.size);

  await client.mongo.connect();
  await client.redis.connect();

  await client.login(process.env.DISCORD_TOKEN);

  await client.registerCommands();

  console.log('Commands registered !');
}

bootstrap();

process.once('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  await client.gracefullShutdown();
  process.exit(0);
})