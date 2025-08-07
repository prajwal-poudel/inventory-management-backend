#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script helps set up the database for the inventory management system.
 * It will run migrations and optionally seed the database with sample data.
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function main() {
  console.log('🏗️  Inventory Management System - Database Setup');
  console.log('================================================\n');

  // Check migration status
  console.log('📊 Checking current migration status...');
  runCommand('npm run db:migrate:status', 'Migration status check');

  // Ask if user wants to run migrations
  const runMigrations = await askQuestion('\n❓ Do you want to run database migrations? (y/n): ');
  
  if (runMigrations === 'y' || runMigrations === 'yes') {
    const success = runCommand('npm run db:migrate', 'Running database migrations');
    
    if (success) {
      console.log('\n🎉 All tables have been created successfully!');
      
      // Ask about seeding
      const runSeeders = await askQuestion('\n❓ Do you want to seed the database with sample data? (y/n): ');
      
      if (runSeeders === 'y' || runSeeders === 'yes') {
        runCommand('npm run db:seed', 'Seeding database with sample data');
        console.log('\n📝 Sample data has been added to the database!');
        console.log('   - Categories: Rice, Wheat, Pulses, Spices, Oil');
        console.log('   - Users: Admin, Manager, Staff');
        console.log('   - Inventories: Main Warehouse, Secondary Storage, Cold Storage');
        console.log('   - Products: Basmati Rice, Wheat Flour, Toor Dal, Turmeric Powder, Sunflower Oil');
      }
    }
  }

  // Show final status
  console.log('\n📊 Final migration status:');
  runCommand('npm run db:migrate:status', 'Final migration status check');

  console.log('\n🚀 Database setup completed!');
  console.log('\nNext steps:');
  console.log('1. Start your application: npm run dev');
  console.log('2. Test your API endpoints');
  console.log('3. Check the database tables in your MySQL client');

  rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled by user');
  rl.close();
  process.exit(0);
});

main().catch((error) => {
  console.error('❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});