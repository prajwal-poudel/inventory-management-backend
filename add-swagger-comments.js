const fs = require('fs');
const path = require('path');

// Route files to process
const routeFiles = [
  'categoryRoutes.js',
  'customerRoutes.js',
  'inventoryRoutes.js',
  'unitRoutes.js',
  'productUnitsRoutes.js'
];

// Basic Swagger comment templates
const swaggerTemplates = {
  get: (tag, summary, description) => `
  // #swagger.tags = ['${tag}']
  // #swagger.summary = '${summary}'
  // #swagger.description = '${description}'
  // #swagger.security = [{ "bearerAuth": [] }]`,
  
  post: (tag, summary, description) => `
  // #swagger.tags = ['${tag}']
  // #swagger.summary = '${summary}'
  // #swagger.description = '${description}'
  // #swagger.security = [{ "bearerAuth": [] }]`,
  
  put: (tag, summary, description) => `
  // #swagger.tags = ['${tag}']
  // #swagger.summary = '${summary}'
  // #swagger.description = '${description}'
  // #swagger.security = [{ "bearerAuth": [] }]`,
  
  delete: (tag, summary, description) => `
  // #swagger.tags = ['${tag}']
  // #swagger.summary = '${summary}'
  // #swagger.description = '${description}'
  // #swagger.security = [{ "bearerAuth": [] }]`
};

// Route configurations
const routeConfigs = {
  'categoryRoutes.js': {
    tag: 'Categories',
    routes: [
      { method: 'get', path: '/', summary: 'Get all categories', description: 'Retrieve all product categories' },
      { method: 'get', path: '/:id', summary: 'Get category by ID', description: 'Retrieve a specific category by its ID' },
      { method: 'post', path: '/', summary: 'Create new category', description: 'Create a new product category (admin only)' },
      { method: 'put', path: '/:id', summary: 'Update category', description: 'Update an existing category (admin only)' },
      { method: 'delete', path: '/:id', summary: 'Delete category', description: 'Delete a category (super admin only)' }
    ]
  },
  'customerRoutes.js': {
    tag: 'Customers',
    routes: [
      { method: 'get', path: '/', summary: 'Get all customers', description: 'Retrieve all customers' },
      { method: 'get', path: '/:id', summary: 'Get customer by ID', description: 'Retrieve a specific customer by their ID' },
      { method: 'post', path: '/', summary: 'Create new customer', description: 'Create a new customer (admin only)' },
      { method: 'put', path: '/:id', summary: 'Update customer', description: 'Update an existing customer (admin only)' },
      { method: 'delete', path: '/:id', summary: 'Delete customer', description: 'Delete a customer (super admin only)' }
    ]
  },
  'inventoryRoutes.js': {
    tag: 'Inventory',
    routes: [
      { method: 'get', path: '/', summary: 'Get all inventories', description: 'Retrieve all inventory locations' },
      { method: 'get', path: '/:id', summary: 'Get inventory by ID', description: 'Retrieve a specific inventory location by its ID' },
      { method: 'post', path: '/', summary: 'Create new inventory', description: 'Create a new inventory location (admin only)' },
      { method: 'put', path: '/:id', summary: 'Update inventory', description: 'Update an existing inventory location (admin only)' },
      { method: 'delete', path: '/:id', summary: 'Delete inventory', description: 'Delete an inventory location (super admin only)' }
    ]
  },
  'unitRoutes.js': {
    tag: 'Units',
    routes: [
      { method: 'get', path: '/', summary: 'Get all units', description: 'Retrieve all units of measurement' },
      { method: 'get', path: '/:id', summary: 'Get unit by ID', description: 'Retrieve a specific unit by its ID' },
      { method: 'post', path: '/', summary: 'Create new unit', description: 'Create a new unit of measurement (admin only)' },
      { method: 'put', path: '/:id', summary: 'Update unit', description: 'Update an existing unit (admin only)' },
      { method: 'delete', path: '/:id', summary: 'Delete unit', description: 'Delete a unit (super admin only)' }
    ]
  },
  'productUnitsRoutes.js': {
    tag: 'Product Units',
    routes: [
      { method: 'get', path: '/', summary: 'Get all product units', description: 'Retrieve all product-unit pricing combinations' },
      { method: 'get', path: '/:id', summary: 'Get product unit by ID', description: 'Retrieve a specific product-unit pricing by its ID' },
      { method: 'post', path: '/', summary: 'Create new product unit', description: 'Create a new product-unit pricing (admin only)' },
      { method: 'put', path: '/:id', summary: 'Update product unit', description: 'Update an existing product-unit pricing (admin only)' },
      { method: 'delete', path: '/:id', summary: 'Delete product unit', description: 'Delete a product-unit pricing (super admin only)' }
    ]
  }
};

console.log('Adding basic Swagger comments to route files...');

routeFiles.forEach(fileName => {
  const filePath = path.join(__dirname, 'routes', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${fileName}`);
    return;
  }
  
  console.log(`Processing ${fileName}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const config = routeConfigs[fileName];
  
  if (!config) {
    console.log(`No configuration found for ${fileName}`);
    return;
  }
  
  // Add basic swagger comments to common route patterns
  config.routes.forEach(route => {
    const routePattern = new RegExp(`router\\.${route.method}\\('${route.path.replace(/:/g, '\\:')}',`, 'g');
    const swaggerComment = swaggerTemplates[route.method](config.tag, route.summary, route.description);
    
    content = content.replace(routePattern, `router.${route.method}('${route.path}', ${swaggerComment}`);
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Updated ${fileName}`);
});

console.log('Swagger comments added successfully!');
console.log('Run "npm run swagger" to regenerate the documentation.');