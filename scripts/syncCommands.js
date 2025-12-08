require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load commands from DscSlash directory
const commands = [];
const commandsPath = path.join(__dirname, '../DscSlash');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
    console.log(`Prepared command for sync: /${command.data.name}`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    // Register commands globally
    console.log('Started refreshing application (/) commands globally.');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Successfully reloaded application (/) commands globally.');
    console.log('Commands synced:');
    commands.forEach(cmd => {
      console.log(`- /${cmd.name}`);
    });
  } catch (error) {
    console.error('Error while syncing commands:', error);
  }
})();
