# Covid-19 Discord bot

A discord bot for daily Covid-19 reports in Slovenia

Add this bot to your server:  
https://discord.com/api/oauth2/authorize?client_id=685875831397941374&permissions=19456&scope=bot

## Setup

Create an image with Docker or use `npm install` then `npm start` to run the bot.

## Environment Variables

Environment variables can be read from the root of the project from a `.env` file.

- `TOKEN` - bot token
- `NODE_ENV` - set to `production` to broadcast to all servers
+ `DEV_SERVER_ID` - server id to send messages when `NODE_ENV` is **NOT** set to `production`