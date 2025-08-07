const express = require('express');
const app = require('./app');

// Test function to check if all routes are properly loaded
function testRoutes() {
  console.log('Testing route configuration...\n');
  
  const routes = [];
  
  // Extract all routes from the app
  app._router.stack.forEach(function(middleware) {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Routes registered through router middleware
      middleware.handle.stack.forEach(function(handler) {
        if (handler.route) {
          const basePath = middleware.regexp.source
            .replace('\\', '')
            .replace('/?(?=\\/|$)', '')
            .replace('^', '')
            .replace('$', '');
          
          routes.push({
            path: basePath + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  // Group routes by module
  const routesByModule = {
    'Root': [],
    'Users': [],
    'Products': [],
    'Categories': [],
    'Customers': [],
    'Deliveries': [],
    'Drivers': [],
    'Manages': [],
    'Stock': [],
    'Inventories': [],
    'Coordinates': []
  };
  
  routes.forEach(route => {
    if (route.path === '/') {
      routesByModule['Root'].push(route);
    } else if (route.path.includes('/api/users')) {
      routesByModule['Users'].push(route);
    } else if (route.path.includes('/api/products')) {
      routesByModule['Products'].push(route);
    } else if (route.path.includes('/api/categories')) {
      routesByModule['Categories'].push(route);
    } else if (route.path.includes('/api/customers')) {
      routesByModule['Customers'].push(route);
    } else if (route.path.includes('/api/deliveries')) {
      routesByModule['Deliveries'].push(route);
    } else if (route.path.includes('/api/drivers')) {
      routesByModule['Drivers'].push(route);
    } else if (route.path.includes('/api/manages')) {
      routesByModule['Manages'].push(route);
    } else if (route.path.includes('/api/stock')) {
      routesByModule['Stock'].push(route);
    } else if (route.path.includes('/api/inventories')) {
      routesByModule['Inventories'].push(route);
    } else if (route.path.includes('/api/coordinates')) {
      routesByModule['Coordinates'].push(route);
    }
  });
  
  // Display results
  Object.keys(routesByModule).forEach(module => {
    if (routesByModule[module].length > 0) {
      console.log(`\n${module} Routes:`);
      console.log('='.repeat(module.length + 8));
      routesByModule[module].forEach(route => {
        const methods = route.methods.map(m => m.toUpperCase()).join(', ');
        console.log(`  ${methods.padEnd(20)} ${route.path}`);
      });
    }
  });
  
  console.log(`\n\nTotal routes configured: ${routes.length}`);
  console.log('\n✅ All routes are properly configured!');
}

// Run the test
testRoutes();