const express = require('express');
const morgan = require('morgan')
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');


// Import routes
// const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const driverRoutes = require('./routes/driverRoutes');
const stockRoutes = require('./routes/stockRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const unitRoutes = require('./routes/unitRoutes');
const productUnitsRoutes = require('./routes/productUnitsRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

const app = express()

// Middleware
app.use(bodyParser.json({limit:"50mb"}))
app.use(bodyParser.urlencoded({extended:true}))
app.use(morgan('dev'))
app.use(cors());

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Inventory Management API Documentation'
}));



// Health check route
app.get("/", (req, res) => {
    res.json({
        message: "Inventory Management System API",
        version: "1.0.0",
        status: "running",
        documentation: "/api-docs",
        endpoints: {
            auth: "/api/auth",
            users: "/api/users",
            categories: "/api/categories",
            products: "/api/products",
            inventory: "/api/inventory",
            stock: "/api/stock",
            customers: "/api/customers",
            orders: "/api/orders",
            drivers: "/api/drivers",
            deliveries: "/api/deliveries",
            units: "/api/units",
            productUnits: "/api/product-units"
        }
    });
});

// API Routes
// app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/product-units', productUnitsRoutes);
app.use('/api/summary', summaryRoutes);

// 404 handler for unmatched routes for API routes only
app.use( (req, res) => {
    res.status(404).json({
        error: 'API Route not found',
        message: `The requested API route ${req.originalUrl} does not exist`,
        documentation: '/api-docs'
    });
});






module.exports = app