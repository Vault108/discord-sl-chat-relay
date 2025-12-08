const fs = require('fs');
const { prompt } = require('enquirer');
const logger = require('./modules/Logger.js');

const questions = [
    {
        type: 'input',
        name: 'DISCORD_TOKEN',
        message: 'Discord Bot Token',
        validate: (value) => value.trim() !== '' || 'This field is required.'
    },
    {
        type: 'input',
        name: 'OWNER',
        message: 'Bot Owner Name',
        validate: (value) => value.trim() !== '' || 'This field is required.'
    },
    {
        type: 'input',
        name: 'SL_FIRSTNAME',
        message: 'Second Life First Name',
        validate: (value) => value.trim() !== '' || 'This field is required.'
    },
    {
        type: 'input',
        name: 'SL_LASTNAME',
        message: 'Second Life Last Name ',
        validate: (value) => value.trim() !== '' || 'This field is required.'
    },
    {
        type: 'password',
        name: 'SL_PASSWORD',
        message: 'Second Life Password',
        validate: (value) => value.trim() !== '' || 'This field is required.'
    },
    {
        type: 'input',
        name: 'SL_START',
        message: 'Second Life Start Location (Default is last)',
        initial: 'last',
        validate: (value) => value.trim() !== '' || 'This field is required.'
    },
    {
        type: 'select',
        name: 'USE_GROUP_NAME',
        message: 'Use Group Name?',
        hint: 'Include the Second Life Group Name in the discord message.',
        choices: [
            {
                name: 'Yes',
                message: 'Yes',
                value: 'yes',
                hint: 'Second Life Group Name will be included in the discord message.'
            },
            { 
                name: 'No',
                message: 'No',
                value: 'no',
                hint: 'Second Life Group Name will NOT be included in the discord message.'
            }
        ],
    },
    {
        type: 'select',
        name: 'USE_PROFILE_PICTURE',
        message: 'Use Posters Secondlife Profile Picture as the Discord Avatar?',
        hint: 'WARNING - Some users may have NSFW profile pictures.',
        choices: [
            {
                name: 'Yes',
                message: 'Yes',
                value: 'yes',
                hint: 'Poster\'s Secondlife Profile pictures will be used in the discord message.' 
            },
            { 
                name: 'No',
                message: 'No',
                value: 'no',
                hint: 'Poster\'s Secondlife Profile pictures will NOT be used in the discord message.'
            }
        ],
    }
];

prompt(questions)
    .then((answers) => {
        logger.success("Configuration completed successfully!");

        // Log answers to an .env file
        const envContent = Object.entries(answers)
            .map(([key, value]) => `${key.toUpperCase()}=${value}`)
            .join('\n');

        fs.writeFileSync('.env', envContent, 'utf8');
        logger.info('Config saved to .env');
    })
    .catch((error) => {
        logger.error('Prompt canceled or an error occurred:', error);
    });