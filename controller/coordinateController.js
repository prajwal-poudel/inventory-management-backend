const { Coordinate, Customer } = require('../models');

// Get all coordinates
const getAllCoordinates = async (req, res) => {
  try {
    const coordinates = await Coordinate.findAll({
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullname', 'phoneNumber', 'address']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Coordinates retrieved successfully',
      data: coordinates
    });
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coordinates',
      error: error.message
    });
  }
};

// Get coordinate by ID
const getCoordinateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coordinate = await Coordinate.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullname', 'phoneNumber', 'address']
        }
      ]
    });
    
    if (!coordinate) {
      return res.status(404).json({
        success: false,
        message: 'Coordinate not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coordinate retrieved successfully',
      data: coordinate
    });
  } catch (error) {
    console.error('Error fetching coordinate:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coordinate',
      error: error.message
    });
  }
};

// Create new coordinate
const createCoordinate = async (req, res) => {
  try {
    const { lat, lng, customer_id } = req.body;
    
    // Validate required fields
    if (!lat || !lng || !customer_id) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, and customer ID are required'
      });
    }
    
    // Validate coordinate values
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be valid numbers'
      });
    }
    
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90 degrees'
      });
    }
    
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180 degrees'
      });
    }
    
    // Check if customer exists
    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if coordinate already exists for this customer
    const existingCoordinate = await Coordinate.findOne({ where: { customer_id } });
    if (existingCoordinate) {
      return res.status(409).json({
        success: false,
        message: 'Coordinate already exists for this customer'
      });
    }
    
    // Create coordinate
    const newCoordinate = await Coordinate.create({
      lat: lat.toString(),
      lng: lng.toString(),
      customer_id
    });
    
    // Fetch the created coordinate with associations
    const coordinateWithAssociations = await Coordinate.findByPk(newCoordinate.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullname', 'phoneNumber', 'address']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Coordinate created successfully',
      data: coordinateWithAssociations
    });
  } catch (error) {
    console.error('Error creating coordinate:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating coordinate',
      error: error.message
    });
  }
};

// Update coordinate
const updateCoordinate = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, customer_id } = req.body;
    
    // Check if coordinate exists
    const coordinate = await Coordinate.findByPk(id);
    if (!coordinate) {
      return res.status(404).json({
        success: false,
        message: 'Coordinate not found'
      });
    }
    
    // Validate coordinate values (if provided)
    if (lat !== undefined) {
      const latitude = parseFloat(lat);
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          message: 'Latitude must be a valid number between -90 and 90 degrees'
        });
      }
    }
    
    if (lng !== undefined) {
      const longitude = parseFloat(lng);
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: 'Longitude must be a valid number between -180 and 180 degrees'
        });
      }
    }
    
    // Check if customer exists (if customer_id is provided)
    if (customer_id) {
      const customer = await Customer.findByPk(customer_id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
      
      // Check if another coordinate exists for this customer (excluding current coordinate)
      const existingCoordinate = await Coordinate.findOne({ 
        where: { 
          customer_id,
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      if (existingCoordinate) {
        return res.status(409).json({
          success: false,
          message: 'Another coordinate already exists for this customer'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (lat !== undefined) updateData.lat = lat.toString();
    if (lng !== undefined) updateData.lng = lng.toString();
    if (customer_id) updateData.customer_id = customer_id;
    
    // Update coordinate
    await coordinate.update(updateData);
    
    // Return updated coordinate with associations
    const updatedCoordinate = await Coordinate.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullname', 'phoneNumber', 'address']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Coordinate updated successfully',
      data: updatedCoordinate
    });
  } catch (error) {
    console.error('Error updating coordinate:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating coordinate',
      error: error.message
    });
  }
};

// Delete coordinate
const deleteCoordinate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if coordinate exists
    const coordinate = await Coordinate.findByPk(id);
    if (!coordinate) {
      return res.status(404).json({
        success: false,
        message: 'Coordinate not found'
      });
    }
    
    // Delete coordinate
    await coordinate.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Coordinate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coordinate:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting coordinate',
      error: error.message
    });
  }
};

// Get coordinate by customer
const getCoordinateByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Check if customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    const coordinate = await Coordinate.findOne({
      where: { customer_id: customerId },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullname', 'phoneNumber', 'address']
        }
      ]
    });
    
    if (!coordinate) {
      return res.status(404).json({
        success: false,
        message: 'No coordinate found for this customer'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coordinate for customer retrieved successfully',
      data: coordinate
    });
  } catch (error) {
    console.error('Error fetching coordinate by customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coordinate by customer',
      error: error.message
    });
  }
};

// Get coordinates within a radius (basic implementation)
const getCoordinatesInRadius = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);
    
    if (isNaN(centerLat) || isNaN(centerLng) || isNaN(radiusKm)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, and radius must be valid numbers'
      });
    }
    
    // Get all coordinates and filter by distance (basic implementation)
    // For production, consider using PostGIS or similar spatial database extensions
    const allCoordinates = await Coordinate.findAll({
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullname', 'phoneNumber', 'address']
        }
      ]
    });
    
    const coordinatesInRadius = allCoordinates.filter(coord => {
      const coordLat = parseFloat(coord.lat);
      const coordLng = parseFloat(coord.lng);
      
      // Simple distance calculation (Haversine formula approximation)
      const R = 6371; // Earth's radius in kilometers
      const dLat = (coordLat - centerLat) * Math.PI / 180;
      const dLng = (coordLng - centerLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(centerLat * Math.PI / 180) * Math.cos(coordLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance <= radiusKm;
    });
    
    res.status(200).json({
      success: true,
      message: `Coordinates within ${radiusKm}km radius retrieved successfully`,
      data: coordinatesInRadius,
      center: { lat: centerLat, lng: centerLng },
      radius: radiusKm
    });
  } catch (error) {
    console.error('Error fetching coordinates in radius:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coordinates in radius',
      error: error.message
    });
  }
};

module.exports = {
  getAllCoordinates,
  getCoordinateById,
  createCoordinate,
  updateCoordinate,
  deleteCoordinate,
  getCoordinateByCustomer,
  getCoordinatesInRadius
};