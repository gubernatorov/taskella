const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  console.log('🚀 Initializing database...');
  
  try {
    // Check if database file exists
    const dbPath = path.join(__dirname, '..', 'sqlite.db');
    if (fs.existsSync(dbPath)) {
      console.log('📄 Database file already exists, skipping initialization...');
      return;
    }

    console.log('📂 Database file not found, initializing...');
    
    // Run the database initialization using npx tsx
    const initCommand = 'npx tsx src/lib/db/init.ts';
    console.log(`🔄 Running: ${initCommand}`);
    
    execSync(initCommand, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log('✅ Database successfully initialized!');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.log('⚠️ Will try to initialize at runtime...');
    // Don't exit, let the application try to initialize at runtime
  }
}

// Run initialization
initDatabase();