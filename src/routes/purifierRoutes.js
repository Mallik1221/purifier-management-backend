const express = require('express');
const router = express.Router();
const purifierController = require('../controllers/purifierController');
const Purifier = require('../models/Purifier');
const axios = require('axios');


// Map to store active timers
const activeTimers = new Map();

router.get('/', purifierController.getAllPurifiers);
router.post('/', purifierController.createPurifier);
router.put('/:id', purifierController.updatePurifier);
router.delete('/:id', purifierController.deletePurifier);
router.patch('/:id/toggle-status', purifierController.togglePurifierStatus);

// Get purifier status(This is Device status) by id
// router.get('/:id/status', async (req, res) => {
//     try {
//         const purifier = await Purifier.findOne({ id: req.params.id });
//         if (!purifier) {
//             return res.status(404).json({ message: 'Purifier not found' });
//         }
//         res.json(purifier.status ? 1 : 0); // Return status as 1 or 0
//     } catch (error) {
//         console.error(`Error fetching purifier: ${error.message}`); // Log the error message
//         res.status(500).json({ message: error.message });
//     }
// });

//NOTE: In the above api endpoint - status => Device status
        //but for the below endpoint - toggle-status[onlineStatus] => Switch status

//Get purifier toggle-status by id
router.get('/:id/status', async (req, res) => {
    try {
        const purifier = await Purifier.findOne({ id: req.params.id });
        if (!purifier) {
            return res.status(404).json({ message: 'Purifier not found' });
        }
        res.json(purifier.onlineStatus ? 1 : 0); // Return status as 1 or 0
    } catch (error) {
        console.error(`Error fetching purifier: ${error.message}`); // Log the error message
        res.status(500).json({ message: error.message });
    }
});

// Update purifier(device) status by id using querying
// router.put('/', async (req, res) => {
//     const { id, status } = req.query;

//     try {
//         const purifier = await Purifier.findOne({ id: id });
//         if (!purifier) {
//             return res.status(404).json({ message: 'Purifier not found' });
//         }

//         // Update the status based on the query parameter
//         purifier.status = false;

//         // Update the status based on the query parameter
//         if (status === '1') {
//             purifier.status = true; // Activate the purifier
//             if (activeTimers.has(id)) {
//                 clearTimeout(activeTimers.get(id)); // Clear existing timer if any
//             }
//             const timer = setTimeout(async () => {
//                 purifier.status = false; // Set status to inactive after 60 seconds
//                 await purifier.save();
//                 activeTimers.delete(id); // Remove timer from map
//             }, 30000); // 30 seconds
//             activeTimers.set(id, timer); // Store the timer
//         } else {
//             if (activeTimers.has(id)) {
//                 clearTimeout(activeTimers.get(id)); // Clear timer if deactivating
//                 activeTimers.delete(id); // Remove timer from map
//             }
//         }

//         await purifier.save();

//         // Return id, message, and status in the response
//         res.json({ 
//             id: purifier.id, 
//             message: 'Purifier status updated successfully', 
//             status: purifier.status ? 1 : 0 
//         });
//     } catch (error) {
//         console.error(`Error updating purifier: ${error.message}`);
//         res.status(500).json({ message: error.message });
//     }
// });


//update switch status by id using querying
// router.put('/', async (req, res) => {
//     const { id, status } = req.query;

//     try {
//         const purifier = await Purifier.findOne({ id: id });
//         if (!purifier) {
//             return res.status(404).json({ message: 'Purifier not found' });
//         }

//         // Update the status based on the query parameter
//         purifier.onlineStatus = false;

//         // Update the status based on the query parameter
//         if (status === '1') {
//             purifier.onlineStatus = true; // Activate the purifier
//         }

//         await purifier.save();

//         // Return id, message, and status in the response
//         res.json({ 
//             id: purifier.id, 
//             message: 'Purifier status updated successfully', 
//             status: purifier.onlineStatus ? 1 : 0 
//         });
//     } catch (error) {
//         console.error(`Error updating purifier: ${error.message}`);
//         res.status(500).json({ message: error.message });
//     }
// });


//thingspeak status updating using querying

router.put('/', async (req, res) => {
    const { id, status } = req.query;

    try {
        const purifier = await Purifier.findOne({ id: id });
        if (!purifier) {
            return res.status(404).json({ message: 'Purifier not found' });
        }

        purifier.onlineStatus = status === '1';

        await purifier.save();

        // Send the status to ThingSpeak
        const THINGSPEAK_API_KEY = 'UAIJU7YW9JQLB8RY';
        const thingSpeakUrl = `https://api.thingspeak.com/update?api_key=${THINGSPEAK_API_KEY}&field1=${status}`;

        const thingSpeakResponse = await axios.get(thingSpeakUrl);

        // Check if ThingSpeak accepted the update (returns entry ID or 0)
        if (thingSpeakResponse.data === 0) {
            console.warn('ThingSpeak did not accept the update');
        }

        res.json({ 
            id: purifier.id, 
            message: 'Purifier status updated and sent to ThingSpeak', 
            status: purifier.onlineStatus ? 1 : 0 
        });
    } catch (error) {
        console.error(`Error updating purifier or sending to ThingSpeak: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;