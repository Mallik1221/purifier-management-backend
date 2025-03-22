const Purifier = require('../models/Purifier');

// Get all purifiers
exports.getAllPurifiers = async (req, res) => {
  try {
    const purifiers = await Purifier.find();
    res.json(purifiers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new purifier
exports.createPurifier = async (req, res) => {
  const purifierData = req.body;

  try {
    const newPurifier = new Purifier(purifierData);
    const savedPurifier = await newPurifier.save();

    // Set status to active and start a timer for 30 seconds
    // savedPurifier.status = true;
    // const timer = setTimeout(async () => {
    //     savedPurifier.status = false; // Set status to inactive after 30 seconds
    //     await savedPurifier.save();
    // }, 30000); // 30 seconds

    res.status(201).json(savedPurifier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a purifier
exports.updatePurifier = async (req, res) => {
  try {
    const updatedPurifier = await Purifier.findOneAndUpdate(
      { id: req.params.id }, 
      { 
        ...req.body, 
        lastUpdated: new Date() 
      }, 
      { new: true, runValidators: true }
    );

    if (!updatedPurifier) {
      return res.status(404).json({ message: 'Purifier not found' });
    }
  
    res.json(updatedPurifier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a purifier
exports.deletePurifier = async (req, res) => {
  try {
    const deletedPurifier = await Purifier.findOneAndDelete({ id: req.params.id });

    if (!deletedPurifier) {
      return res.status(404).json({ message: 'Purifier not found' });
    }

    res.json({ message: 'Purifier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle purifier status
exports.togglePurifierStatus = async (req, res) => {
  try {

    const purifier = await Purifier.findOne({ id: req.params.id });

    if (!purifier) {
      console.error(`Purifier not found with ID: ${req.params.id}`);
      return res.status(404).json({ 
        message: 'Purifier not found', 
        id: req.params.id 
      });
    }

    // Explicitly toggle the status
    // purifier.status = purifier.status === true ? false : true;
    purifier.onlineStatus = !purifier.onlineStatus ;
  
    purifier.lastUpdated = new Date();
    
    const updatedPurifier = await purifier.save();
    

    res.json(updatedPurifier);
  } catch (error) {
    console.error('Toggle Status Error:', error);
    res.status(500).json({ 
      message: 'Error toggling purifier status', 
      error: error.message 
    });
  }
};