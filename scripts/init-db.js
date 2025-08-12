const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  console.log('🚀 Инициализация базы данных...');
  
  try {
    // Импортируем функцию инициализации
    const { initializeDatabase } = require('../src/lib/db/init.ts');
    
    await initializeDatabase();
    console.log('✅ База данных успешно инициализирована!');
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    process.exit(1);
  }
}

// Запускаем инициализацию
initDatabase();