# Discord RPG Bot

Simple Discord RPG bot for small groups, built with Discord.js v14, Prisma, SQLite, and strict TypeScript.

## Features

- `/register` creates a player profile.
- `/profile` shows stats, XP progress, inventory, cooldowns, and top beast.
- `/daily` grants gold or a random item.
- `/hunt` runs the catch-and-battle loop with combat, passive HP recovery, hospital lockout, and timed beast captures.

## Stack

- TypeScript (strict mode)
- discord.js v14
- Prisma + SQLite

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Fill in `.env`:

   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_GUILD_ID` for fast guild command sync during development
   - `DATABASE_URL`

3. Generate the Prisma client:

   ```bash
   npx prisma generate
   ```

4. Push the SQLite schema:

   ```bash
   npx prisma db push
   ```

5. Start the bot in development:

   ```bash
   npm run dev
   ```

## Notes

- Commands sync automatically on startup.
- Passive HP recovery restores 1 HP every 2 minutes when the player is out of combat and not in the hospital.
- Beast capture buttons expire after 30 seconds and release busy state automatically.
