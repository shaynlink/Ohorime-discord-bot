import type Client from '../Client';

export default function ready(client: Client<true>) {
  console.log(`Logged in as ${client.user.tag}`);
}