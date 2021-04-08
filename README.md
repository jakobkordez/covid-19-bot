# Covid-19 Discord bot

A discord bot for daily Covid-19 reports in Slovenia

Add this bot to your server:  
https://discord.com/api/oauth2/authorize?client_id=685875831397941374&permissions=19456&scope=bot

<img src="docs/screenshot.png">

## Setup

Create an image with Docker or use `npm install` then `npm start` to run the bot.

## Channel selection (new)

You can now set a custom channel to send daily reports to.  
You will need `ADMINISTRATOR` permissions on the server.  
To set a custom channel use: `cv!channel [channel_name]`.

## Environment Variables

Environment variables can be read from the root of the project from a `.env` file.

- `TOKEN` - bot token
- `NODE_ENV` - set to `production` to broadcast to all servers
+ `DEV_SERVER_ID` - server id to send messages when `NODE_ENV` is **NOT** set to `production`
