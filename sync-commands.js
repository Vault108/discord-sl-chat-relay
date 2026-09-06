const { REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const path = require('path');
const logger = require('./modules/Logger.js');

const projectRoot = path.basename(__dirname) === 'DscSlash'
    ? path.dirname(__dirname)
    : __dirname;

require('dotenv').config({
    path: path.join(projectRoot, '.env'),
});

const commandData = [];
const commandDirectory = path.join(projectRoot, 'DscSlash');
const commandFiles = readdirSync(commandDirectory)
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandDirectory, file));

    if (!command.data || !command.execute) {
        throw new Error(`Command ${file} is missing data or execute.`);
    }

    commandData.push(command.data.toJSON());
}

const token = process.env.DISCORD_TOKEN;
let clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;

if (!token) {
    throw new Error('DISCORD_TOKEN is missing from .env');
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        if (!clientId) {
            const botUser = await rest.get(Routes.user('@me'));
            clientId = botUser.id;
        }

        logger.log(`Syncing ${commandData.length} global slash commands:`);
        for (const command of commandData) {
            logger.log(`- /${command.name}`);
        }
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commandData },
        );
        logger.log('Global slash commands synced successfully.');
    } catch (error) {
        logger.error('Failed to sync slash commands:', error);
        process.exitCode = 1;
    }
})();