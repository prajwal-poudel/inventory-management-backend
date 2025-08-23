const { User, Manages, Inventory } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    }
  );
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Exclude password from response
      include: [
        {
          model: Manages,
          as: 'managedItems',
          include: [
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['id', 'inventoryName', 'location']
            }
          ],
          required: false // Left join to include users without managed inventories
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Manages,
          as: 'managedItems',
          include: [
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['id', 'inventoryName', 'location']
            }
          ],
          required: false // Left join to include users without managed inventories
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { fullname, email, password, role, inventoryId } = req.body;
    
    // Validate required fields
    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
      });
    }
    
    // Validate role-specific requirements
    const userRole = role || 'driver';
    if ((userRole === 'admin') && !inventoryId) {
      return res.status(400).json({
        success: false,
        message: 'Inventory ID is required for admin role'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // If inventoryId is provided, validate that the inventory exists
    let inventory = null;
    if (inventoryId) {
      inventory = await Inventory.findByPk(inventoryId);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory not found'
        });
      }
    }
    
    // Use database transaction to ensure data consistency
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const newUser = await User.create({
        fullname,
        email,
        password: hashedPassword,
        role: userRole
      }, { transaction });
      
      // If user is admin, create manages relationship
      let managesRecord = null;
      if ((userRole === 'admin') && inventoryId) {
        // // Check if this inventory is already managed by another admin
        // const existingManagement = await Manages.findOne({
        //   where: { inventory_id: inventoryId },
        //   transaction
        // });
        
        // if (existingManagement) {
        //   await transaction.rollback();
        //   return res.status(409).json({
        //     success: false,
        //     message: `Inventory '${inventory.inventoryName}' is already managed by another admin`
        //   });
        // }
        
        // Create manages relationship
        managesRecord = await Manages.create({
          user_id: newUser.id,
          inventory_id: inventoryId
        }, { transaction });
      }
      
      // Commit the transaction
      await transaction.commit();
      
      // Prepare user response (exclude password)
      const userResponse = {
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };
      
      // Add inventory information if applicable
      if (inventory && managesRecord) {
        userResponse.managedInventory = {
          id: inventory.id,
          inventoryName: inventory.inventoryName,
          location: inventory.location,
          managesId: managesRecord.id
        };
      }
      
      res.status(201).json({
        success: true,
        message: `User created successfully${inventory ? ` and assigned to manage inventory '${inventory.inventoryName}'` : ''}`,
        data: userResponse
      });
      
    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, password, role, inventoryId } = req.body;
    
    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }
    
    // Validate role-specific requirements
    const newRole = role || user.role;
    if ((newRole === 'admin') && inventoryId !== undefined) {
      // If inventoryId is provided, validate that the inventory exists
      if (inventoryId !== null) {
        const inventory = await Inventory.findByPk(inventoryId);
        if (!inventory) {
          return res.status(404).json({
            success: false,
            message: 'Inventory not found'
          });
        }
        
        // // Check if this inventory is already managed by another admin (excluding current user)
        // const existingManagement = await Manages.findOne({
        //   where: { 
        //     inventory_id: inventoryId,
        //     user_id: { [require('sequelize').Op.ne]: id }
        //   }
        // });
        
        // if (existingManagement) {
        //   return res.status(409).json({
        //     success: false,
        //     message: 'Inventory is already managed by another admin'
        //   });
        // }
      }
    }
    
    // Use database transaction to ensure data consistency
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      // Prepare update data
      const updateData = {};
      if (fullname) updateData.fullname = fullname;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      
      // Hash password if provided
      if (password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }
      
      // Update user
      await user.update(updateData, { transaction });
      
      // Handle inventory management changes for admin/superadmin roles
      if ((newRole === 'admin') && inventoryId !== undefined) {
        // Remove existing manages relationships for this user
        await Manages.destroy({
          where: { user_id: id },
          transaction
        });
        
        // Create new manages relationship if inventoryId is provided (not null)
        if (inventoryId !== null) {
          await Manages.create({
            user_id: id,
            inventory_id: inventoryId
          }, { transaction });
        }
      }
      
      // Commit the transaction
      await transaction.commit();
      
      // Return updated user without password and with managed inventory info
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Manages,
            as: 'managedItems',
            include: [
              {
                model: Inventory,
                as: 'inventory',
                attributes: ['id', 'inventoryName', 'location']
              }
            ],
            required: false
          }
        ]
      });
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
      
    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete user
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role
    const validRoles = ['admin', 'superadmin', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Valid roles are: admin, superadmin, user'
      });
    }
    
    const users = await User.findAll({
      where: { role },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Users with role '${role}' retrieved successfully`,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users by role',
      error: error.message
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data and token (exclude password)
    const userResponse = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token: token
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Verify token (for protected routes)
const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: user,
        tokenData: decoded
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

// Get users by inventory ID (get admins managing a specific inventory)
const getUsersByInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    
    // Validate that inventory exists
    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    // Find users managing this inventory
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Manages,
          as: 'managedItems',
          where: { inventory_id: inventoryId },
          include: [
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['id', 'inventoryName', 'location']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Users managing inventory '${inventory.inventoryName}' retrieved successfully`,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users by inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users by inventory',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await user.update({ password: hashedNewPassword });
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
  getUsersByInventory,
  loginUser,
  verifyToken,
  changePassword
};