# Raid Companion Discord Bot

Listens for image attachments in configured Discord channels and forwards them to the
`discord-image-ingest` Supabase Edge Function for OCR processing.

---

## Prerequisites

- A GitHub account and this repository pushed to it
- A [Railway](https://railway.app) account
- A Discord application with a bot token (see step 1 below)

---

## Step 1 — Create the Discord Application & Bot

1. Go to https://discord.com/developers/applications and click **New Application**.
2. Give it a name (e.g. `Raid Companion`), then open the **Bot** tab.
3. Click **Reset Token** and copy the token — you will need it in Step 4.
4. Under **Privileged Gateway Intents**, enable **Message Content Intent**.
5. Save changes.

---

## Step 2 — Invite the Bot to Your Server

1. In the Discord Developer Portal, open the **OAuth2 → URL Generator** tab.
2. Under **Scopes**, select `bot`.
3. Under **Bot Permissions**, select `Read Messages/View Channels` and `Read Message History`.
4. Copy the generated URL and open it in a browser to invite the bot to your server.

---

## Step 3 — Add the Bot to the Target Channel

1. In Discord, right-click the channel where screenshots will be posted.
2. Go to **Edit Channel → Permissions**.
3. Add the bot user and grant it **View Channel** and **Read Message History**.

---

## Step 4 — Create the Railway Project

1. Log in to [Railway](https://railway.app).
2. Click **New Project → Deploy from GitHub repo**.
3. Connect your GitHub account and select this repository.
4. Railway will detect the Dockerfile automatically.

---

## Step 5 — Set Environment Variables in Railway

In the Railway project dashboard, go to **Variables** and add:

| Variable             | Value                                                                 |
|----------------------|-----------------------------------------------------------------------|
| `DISCORD_BOT_TOKEN`  | The bot token from Step 1                                             |
| `SUPABASE_INGEST_URL`| `https://<project-ref>.supabase.co/functions/v1/discord-image-ingest`|

Railway injects these at runtime — they are never written to any file.

---

## Step 6 — Deploy

1. Trigger a deploy in Railway (or push a commit to the connected branch).
2. Open **Logs** in the Railway dashboard — you should see `Bot ready: YourBot#1234`.

---

## Step 7 — Configure Channels in the App

In the Raid Companion Android app:

1. Open your Cluster dashboard.
2. Tap **Officer Dashboard → Discord Setup** (visible to Cluster Leaders only).
3. For each clan and mode, enter the Discord **channel ID** and enable the toggle.
4. Enter your bot token once in the token field and tap **Save Token**.

To find a Discord channel ID: enable Developer Mode in Discord settings, then
right-click any channel and select **Copy Channel ID**.

---

## How It Works

```
Discord user posts screenshot
        │
        ▼
  discord.js bot detects image attachment
        │
        ▼
  POST /functions/v1/discord-image-ingest
    { channel_id, image_url, filename }
        │
        ▼
  Edge function looks up clan_id + mode
  Downloads image → uploads to Storage
  Inserts clan image record → calls create-import-batch
        │
        ▼
  OCR pipeline processes the image
```
