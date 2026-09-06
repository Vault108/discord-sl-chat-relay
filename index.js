// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.
if (Number(process.version.slice(1).split('.')[0]) < 16) throw new Error('Node 16.x or higher is required. Update Node on your system.');
require('dotenv').config();
const Sentry = require("./sentry.js");
const http = require("http");
const dmRelay = require('./modules/relayDM.js');
const originalConsoleLog = console.log; // do not remove this line
// Override console.log
console.log = function (...args) {
    logger.info(...args);
};
const originalConsoleWarn = console.warn; // do not remove this line
console.warn = function (...args) {
    logger.warn(...args);
};
const originalConsoleError = console.error; // do not remove this line 

console.error = function (...args) {
    const error = args.find((arg) => arg instanceof Error);
    if (error) {
        Sentry.captureException(error);
        console.log("Error captured and sent to Sentry");
    } else if (args.length > 0) {
        Sentry.captureMessage(args.map(String).join(' '), 'error');
    }
    signale.error(...args);

};
const  originalConsoleDebug = console.debug; // do not remove this line
console.debug = function (...args) {
    logger.debug(...args);
};
const originalConsoleInfo = console.info; // do not remove this line            
console.info = function (...args) {
    logger.info(...args);
};
// Load up the discord.js library
const { Client, Collection, Events } = require('discord.js');
// Load Node Meta
const nmv = require('@caspertech/node-metaverse');
// We also load the rest of the things we need in this file:
const { readdirSync } = require('fs');
const { intents, partials, permLevels } = require('./config.js');
const config = require('./config.js');
const logger = require('./modules/Logger.js');
const signale = require('signale');

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`,
// or `bot.something`, this is what we're referring to. Your client.
//const packageinfo = require("./package.json");
const client = new Client({ intents, partials });
const slashcmds = new Collection();

const { UUID } = nmv;

const loginParameters = new nmv.LoginParameters();
loginParameters.firstName = process.env.SL_FIRSTNAME;
loginParameters.lastName = process.env.SL_LASTNAME;
loginParameters.password = process.env.SL_PASSWORD;
loginParameters.start = process.env.SL_START;

const options = nmv.BotOptionFlags.LiteObjectStore | nmv.BotOptionFlags.StoreMyAttachmentsOnly;
const SLbot = new nmv.Bot(loginParameters, options);


// Generate a cache of client permissions for pretty perm names in commands.
const levelCache = {};


// To reduce client pollution we'll create a single container property
// that we can attach everything we need to.
client.container = {
    slashcmds,
    levelCache,
    SLbot,
    nmv,
};
const GroupChatEventHandler = require('./SLevents/GroupChat.js');
const ChatEventHandler = require('./SLevents/ChatEvent.js');

// We're doing real fancy node 8 async/await stuff here, and to do that
// we need to wrap stuff in an anonymous function. It's annoying but it works.

const init = async () => {


    client.container.SLbot.login().then((response) => {
        logger.success('SL: Login Complete');

        // Establish circuit with region
        return client.container.SLbot.connectToSim();
    }).then(() => {
        logger.success('SL: Connected to Region');


    }).then(async () => {

        // client.container.SLbot.clientEvents.onGroupChat.subscribe(groupChatEventFile.bind(client));

        client.container.SLbot.clientEvents.onGroupChat.subscribe((eventInfo) => {
            GroupChatEventHandler(client, eventInfo);

        });
        client.container.SLbot.clientEvents.onNearbyChat.subscribe((eventInfo) => {
            ChatEventHandler(client, eventInfo);
        
        });
        // TODO: add mappings for Group Notices


    }).catch((error) => {
        console.error(error);
    });

    // NOW LOADING DISCORD SIDE OF THE BOT

    // Now we load any **slash** commands you may have in the ./slash directory.
    const slashFiles = readdirSync('./DscSlash').filter(file => file.endsWith('.js'));
    for (const file of slashFiles) {
        const command = require(`./DscSlash/${file}`);
        const commandName = file.split('.')[0];
        logger.success(`Loading Slash command: ${commandName}. `);

        // This is the corrected way to load modern commands.
        // It now checks for the correct 'data' and 'execute' properties.
        if ('data' in command && 'execute' in command) {
            client.container.slashcmds.set(command.data.name, command);
        } else {
            logger.error(`[WARNING] The command at ${commandName}.js is missing a required "data" or "execute" property.`, 'error');
        }
    }

    // Then we load events, which will include our message and ready event.
    const eventFiles = readdirSync('./DscEvents/').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const eventName = file.split('.')[0];
        logger.success(`Loading Discord Event: ${eventName}. `);
        const event = require(`./DscEvents/${file}`);
        // Bind the client to any event, before the existing arguments
        // provided by the discord.js event.
        // This line is awesome by the way. Just sayin'.
        client.on(eventName, event.bind(null, client));
    }

    // This logs a message to the console once the bot has successfully logged in.
    client.once(Events.ClientReady, c => {
        const packageinfo = require("./package.json"); 
        const dversion = packageinfo.version;
        const name = packageinfo.name;
        logger.success(`Ready! Logged in as ${c.user.tag}`);
        logger.success(`package name: ${name}`);
        logger.success(`package version: ${dversion}`);
    const pkg = require('./package.json');
        Object.entries(pkg.dependencies || {}).forEach(([dep, ver]) => {
            logger.success(`dependency: ${dep}@${ver}`);
        });
        dmRelay(SLbot, client);


    });
    
    // This adds an error listener
    client.on('error', (err) => {
        logger.error('Discord.js Error:', err);
    });


    // Here we login the client.
    client.login().catch(error => {
     if (error.message.includes('disallowed intents')) {
        logger.fatal(new Error('Make sure \x1b[1mALL\x1b[0m privileged intents are enabled in the Discord Developer Portal.'));
        logger.fatal(new Error('The bot will \x1b[1mNOT\x1b[0m work as intended.'));
        process.exit(1);
        } else {
            // eventually handle other errors here  
        }
    });
// End top-level async/await function.
};

init();
