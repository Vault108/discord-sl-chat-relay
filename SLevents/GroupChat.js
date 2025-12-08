const config = require('../config.js');
const axios = require('axios').default;
const nmv = require('@caspertech/node-metaverse');
const logger = require('../modules/Logger.js');
const getGroupNameFromUUID = require('./getGroupName');
const { UUID } = nmv;
const usegroupname = process.env.USE_GROUP_NAME === 'true';
const useprofilepicture = process.env.USE_PROFILE_PICTURE === 'true';

logger.info(usegroupname ? 'Not posting message with Group name.' : 'Posting message with Group name.');
logger.info(useprofilepicture ? 'Not posting message with Profile picture.' : 'Posting message with Profile picture.');

async function fetchGroupName(groupUUID) {
  try {
    const groupName = await getGroupNameFromUUID(groupUUID);
    return groupName;
  } catch (error) {
    logger.error(`Failed to fetch group name for UUID ${groupUUID}:`, error);
    return 'Unknown Group';
  }
}

// Decode and log group UUIDs from config.js
(async () => {
  for (const [groupUUID] of config.relays) {
    try {
      const groupName = await fetchGroupName(groupUUID);
      logger.info(`Relaying Messages From: ${groupName} to Discord Channel ID: ${config.relays.get(groupUUID)}`); 
    } catch (error) {
      logger.error(`Failed to decode group UUID: ${groupUUID}`, error);
    }
  }
})();

// Decode and log Discord channel IDs to names
(async () => {
  for (const [groupUUID, channelID] of config.relays) {
    try {
      const channel = client.channels.cache.get(channelID);
      if (channel) {
        logger.info(`Channel ID: ${channelID}, Channel Name: ${channel.name}`);
      } else {
        logger.warn(`Channel ID: ${channelID} not found in cache.`);
      }
    } catch (error) {
      logger.error(`Failed to decode channel ID: ${channelID}`, error);
    }
  }
})();

module.exports = async (client, GroupChatEvent) => {
  const SLbot = client.container.SLbot;
  const currentBot = `${process.env.SL_FIRSTNAME} ${process.env.SL_LASTNAME}`;
  if (GroupChatEvent.fromName === currentBot) return;
  if (
    config.ignoredSet?.has(GroupChatEvent.from.toString()) ||
    config.ignored.includes(GroupChatEvent.from.toString())
  )
    return;

  let img = 'bfc51542-be49-4595-9784-aec1e3f612dc';
  let avatarURL = useprofilepicture
    ? `https://picture-service.secondlife.com/${img}/320x240.jpg`
    : undefined;

  if (config.relays.has(GroupChatEvent.groupID.toString())) {
    try {
      let message = GroupChatEvent.message;
      if (message.startsWith('/me')) {
        message = `*${message.replace('/me', '').trim()}*`;
      }

      try {
        // TODO: Make this a Regex
        const profile = await axios.get(
          `http://world.secondlife.com/resident/${GroupChatEvent.from}`
        );
        const match = profile.data.match(
          /<meta name="imageid" content="([^"]+)"/
        );
        if (match) img = match[1];
      } catch (error) {
        console.error('Failed fetching profile image:', error.message);
      }

      const channel = client.channels.cache.get(
        config.relays.get(GroupChatEvent.groupID.toString())
      );
      if (!channel) return;
      let webhooks = await channel.fetchWebhooks();
      let webhook = webhooks.find((wh) => wh.token);
      if (!webhook) {
        webhook = await channel.createWebhook({
          name: 'relay-bot',
          avatar: 'https://i.imgur.com/AfFp7pu.png',
        });
        console.log('Created webhook'); // do not log webhook url
      }

      // Fetch group name using the helper function if enabled
      let groupName = '';
      if (usegroupname) {
        groupName = await fetchGroupName(GroupChatEvent.groupID);
        logger.info('Decoded Group Name:', groupName);
      }

      await webhook.send({
        content: message,
        username: `${GroupChatEvent.fromName} (inworld)`,
        avatarURL: `https://picture-service.secondlife.com/${img}/320x240.jpg`,
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      console.error('Failed to relay to Discord:', error.message);
    }
  }
};