'use strict';

const { Client, GatewayIntentBits } = require('discord.js');

const BOT_TOKEN   = process.env.DISCORD_BOT_TOKEN;
const INGEST_URL  = process.env.SUPABASE_INGEST_URL;

if (!BOT_TOKEN)  { console.error('Missing DISCORD_BOT_TOKEN'); process.exit(1); }
if (!INGEST_URL) { console.error('Missing SUPABASE_INGEST_URL'); process.exit(1); }

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Bot ready: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages and messages without attachments
  if (message.author.bot) return;
  if (!message.attachments.size) return;

  const imageAttachments = [...message.attachments.values()].filter(
    (a) => a.contentType && a.contentType.startsWith('image/')
  );
  if (!imageAttachments.length) return;

  const channelId = message.channelId;

  for (const attachment of imageAttachments) {
    try {
      const res = await fetch(INGEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: channelId,
          image_url:  attachment.url,
          filename:   attachment.name || 'image.png',
        }),
      });

      const text = await res.text();

      if (res.ok) {
        let batchId = text;
        try { batchId = JSON.parse(text).batch_id ?? text; } catch {}
        console.log(`✓ channel=${channelId} file=${attachment.name} batch_id=${batchId}`);
      } else {
        let errMsg = text;
        try { errMsg = JSON.parse(text).error ?? text; } catch {}
        console.error(`✗ channel=${channelId} file=${attachment.name} status=${res.status} error=${errMsg}`);
      }
    } catch (err) {
      console.error(`✗ channel=${channelId} file=${attachment.name} network_error=${err.message}`);
    }
  }
});

client.login(BOT_TOKEN);
