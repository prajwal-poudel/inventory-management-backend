const { Unit, Product, Inventory } = require('../../models');

/**
 * Validate required fields for stock creation
 * @param {Object} data - Request body data
 * @returns {Object} Validation result with success and message
 */
const validateStockCreationFields = (data) => {
  const { stockQuantity, unit_id, product_id, inventory_id, in_out } = data;
  
  if (stockQuantity === undefined || !unit_id || !product_id || !inventory_id || !in_out) {
    return {
      success: false,
      message: 'Stock quantity, unit ID, product ID, inventory ID, and in_out are required'
    };
  }
  
  return { success: true };
};

/**
 * Validate transfer method requirements
 * @param {Object} data - Request body data
 * @returns {Object} Validation result with success and message
 */
const validateTransferMethod = (data) => {
  const { method, in_out, targetInventoryId, inventory_id } = data;
  
  if (method === 'transfer' && in_out === 'out' && !targetInventoryId) {
    return {
      success: false,
      message: 'Target inventory ID is required when method is transfer and in_out is out'
    };
  }
  
  if (method === 'transfer' && in_out === 'out' && inventory_id === targetInventoryId) {
    return {
      success: false,
      message: 'Source and target inventories cannot be the same'
    };
  }
  
  return { success: true };
};

/**
 * Validate stock quantity is positive
 * @param {number} stockQuantity - Stock quantity to validate
 * @returns {Object} Validation result with success and message
 */
const validateStockQuantity = (stockQuantity) => {
  if (stockQuantity <= 0) {
    return {
      success: false,
      message: 'Stock quantity must be positive'
    };
  }
  
  return { success: true };
};

/**
 * Validate in_out field
 * @param {string} in_out - in_out value to validate
 * @returns {Object} Validation result with success and message
 */
const validateInOutField = (in_out) => {
  if (!['in', 'out'].includes(in_out)) {
    return {
      success: false,
      message: 'in_out must be either "in" or "out"'
    };
  }
  
  return { success: true };
};

/**
 * Validate operation for quantity updates
 * @param {string} operation - Operation to validate
 * @returns {Object} Validation result with success and message
 */
const validateOperation = (operation) => {
  if (!['ADD', 'SUBTRACT'].includes(operation)) {
    return {
      success: false,
      message: 'Operation must be either ADD or SUBTRACT'
    };
  }
  
  return { success: true };
};

/**
 * Check if unit exists
 * @param {number} unit_id - Unit ID to check
 * @returns {Object} Validation result with success, message, and data
 */
const validateUnitExists = async (unit_id) => {
  const unit = await Unit.findByPk(unit_id);
  if (!unit) {
    return {
      success: false,
      message: 'Unit not found'
    };
  }
  
  return { success: true, data: unit };
};

/**
 * Check if product exists
 * @param {number} product_id - Product ID to check
 * @returns {Object} Validation result with success, message, and data
 */
const validateProductExists = async (product_id) => {
  const product = await Product.findByPk(product_id);
  if (!product) {
    return {
      success: false,
      message: 'Product not found'
    };
  }
  
  return { success: true, data: product };
};

/**
 * Check if inventory exists
 * @param {number} inventory_id - Inventory ID to check
 * @returns {Object} Validation result with success, message, and data
 */
const validateInventoryExists = async (inventory_id) => {
  const inventory = await Inventory.findByPk(inventory_id);
  if (!inventory) {
    return {
      success: false,
      message: 'Inventory not found'
    };
  }
  
  return { success: true, data: inventory };
};

/**
 * Validate all entities exist for stock creation
 * @param {Object} data - Request body data
 * @returns {Object} Validation result with success, message, and entities data
 */
const validateEntitiesExist = async (data) => {
  const { unit_id, product_id, inventory_id, targetInventoryId, method, in_out } = data;
  
  // Check if unit exists
  const unitValidation = await validateUnitExists(unit_id);
  if (!unitValidation.success) {
    return unitValidation;
  }
  
  // Check if product exists
  const productValidation = await validateProductExists(product_id);
  if (!productValidation.success) {
    return productValidation;
  }
  
  // Check if inventory exists
  const inventoryValidation = await validateInventoryExists(inventory_id);
  if (!inventoryValidation.success) {
    return inventoryValidation;
  }
  
  // Check if target inventory exists (for transfers)
  let targetInventory = null;
  if (method === 'transfer' && in_out === 'out' && targetInventoryId) {
    const targetInventoryValidation = await validateInventoryExists(targetInventoryId);
    if (!targetInventoryValidation.success) {
      return {
        success: false,
        message: 'Target inventory not found'
      };
    }
    targetInventory = targetInventoryValidation.data;
  }
  
  return {
    success: true,
    data: {
      unit: unitValidation.data,
      product: productValidation.data,
      inventory: inventoryValidation.data,
      targetInventory
    }
  };
};

/**
 * Validate threshold parameter
 * @param {string|number} threshold - Threshold value to validate
 * @returns {number} Parsed threshold value
 */
const validateThreshold = (threshold = 10) => {
  return parseFloat(threshold);
};

module.exports = {
  validateStockCreationFields,
  validateTransferMethod,
  validateStockQuantity,
  validateInOutField,
  validateOperation,
  validateUnitExists,
  validateProductExists,
  validateInventoryExists,
  validateEntitiesExist,
  validateThreshold
};