const axios = require('axios');

const THINGSPEAK_CHANNEL_ID = '2955829';
const READ_API_KEY = '4YRDEEQB58UG7TVR';
const BACKEND_URL = 'http://localhost:5000/api/purifiers';

let lastEntryId = null;

function startPoller() {
    setInterval(async () => {
        try {
        const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}&results=1`;
        const response = await axios.get(url);
        const feed = response.data.feeds[0];

        if (!feed) return;

        const entryId = feed.entry_id;
        const id = feed.field1;
        const status = feed.field2;

        if (entryId === lastEntryId) return; // Skip duplicate

        lastEntryId = entryId;

        console.log(`Calling backend: id=${id}, status=${status}`);

        await axios.put(`${BACKEND_URL}?id=${id}&status=${status}`);

    } catch (err) {
            console.error('Poller error:', err.message);
        }
    }, 10000); // 10 seconds
}

module.exports = startPoller;