const express = require('express');
const router = express.Router();
const purifierController = require('../controllers/purifierController');
const Purifier = require('../models/Purifier');
const axios = require('axios');


// Map to store active timers
const activeTimers = new Map();
 //  Update purifier(device) status by id using querying
router.put('/update-status', async (req, res) => {
    console.log("Hit update-status route");

    const { id, status } = req.query;
    console.log("Incoming ID:", id);

    try {
        const purifier = await Purifier.findOne({id:id});
        if (!purifier) {
            return res.status(404).json({ message: 'Purifier not found' });
        }

        // Update the status based on the query parameter
        purifier.status = false;

        // Update the status based on the query parameter
        if (status === '1') {
            purifier.status = true; // Activate the purifier
            if (activeTimers.has(id)) {
                clearTimeout(activeTimers.get(id)); // Clear existing timer if any
            }
            const timer = setTimeout(async () => {
                purifier.status = false; // Set status to inactive after 60 seconds
                await purifier.save();
                activeTimers.delete(id); // Remove timer from map
            }, 30000); // 30 seconds
            activeTimers.set(id, timer); // Store the timer
        } else {
            if (activeTimers.has(id)) {
                clearTimeout(activeTimers.get(id)); // Clear timer if deactivating
                activeTimers.delete(id); // Remove timer from map
            }
        }

        await purifier.save();

        // Return id, message, and status in the response
        res.json({ 
            id: purifier.id, 
            message: 'Purifier status updated successfully', 
            status: purifier.status ? 1 : 0 
        });
    } catch (error) {
        console.error(`Error updating purifier: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

// New route which returns current switch status & activate device status to 1 or 0.
//the below route is somewhat confusing here the route name is diff, but it would work as same; refer model.js 
router.get('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { onlineStatus } = req.query;

  try {
    const purifier = await Purifier.findOne({ id });

    if (!purifier) {
      return res.status(404).json({ message: 'Purifier not found', id });
    }

    // If onlineStatus=1 is passed, activate device temporarily (status = true for 30s)
    if (onlineStatus === '1') {
      purifier.status = true; // turn on device

      if (activeTimers.has(id)) {
        clearTimeout(activeTimers.get(id)); // clear existing timer
      }

      const timer = setTimeout(async () => {
        purifier.status = false; // turn off after 30 seconds
        await purifier.save();
        activeTimers.delete(id);
      }, 30000); // 30 seconds

      activeTimers.set(id, timer);
      await purifier.save();
    }

    // Return only the switch status (onlineStatus)
    return res.json({
      id: purifier.id,
      message: onlineStatus === '1' 
        ? 'Switch status returned and purifier activated' 
        : 'Switch status returned',
      switchStatus: purifier.onlineStatus ? 1 : 0 // onlineStatus is the switch
    });

  } catch (error) {
    console.error('Error in /:id/status route:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});




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
    //moved to top: because of route order precedence

   


//update switch status by id using querying
router.put('/', async (req, res) => {
    const { id, status } = req.query;

    try {
        const purifier = await Purifier.findOne({ id: id });
        if (!purifier) {
            return res.status(404).json({ message: 'Purifier not found' });
        }

        // Update the status based on the query parameter
        purifier.onlineStatus = false;

        // Update the status based on the query parameter
        if (status === '1') {
            purifier.onlineStatus = true; // Activate the purifier
        }

        await purifier.save();

        // Return id, message, and status in the response
        res.json({ 
            id: purifier.id, 
            message: 'Purifier status updated successfully', 
            status: purifier.onlineStatus ? 1 : 0 
        });
    } catch (error) {
        console.error(`Error updating purifier: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;