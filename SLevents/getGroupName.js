const axios = require('axios');

/**
 * Fetches and decodes the group name from a UUID using Second Life's API.
 * @param {string} groupUUID - The UUID of the group.
 * @returns {Promise<string>} - The decoded group name.
 */

async function getGroupNameFromUUID(groupUUID) {
  try {
    const response = await axios.get(`https://world.secondlife.com/group/${groupUUID}`);
    const html = response.data;
    // Extract the content of the <title> tag
    const match = html.match(/<title>(.*?)<\/title>/);
    if (match && match[1]) {
      let groupName = match[1];

      // Decode HTML entities, including apostrophes
      groupName = groupName.replace(/&#x27;/g, "'");
      return groupName;
    } else {
      throw new Error('Title not found in the HTML response.');
    }
  } catch (error) {
    console.error('Failed to get group name:', error);
    throw error;
  }
}

module.exports = getGroupNameFromUUID;