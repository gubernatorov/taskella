#!/bin/bash

echo "🔍 Диагностика проблем со стилями..."

# Проверяем основные файлы
echo "📁 Проверка файлов конфигурации:"

if [ -f "tailwind.config.ts" ]; then
    echo "✅ tailwind.config.ts найден"
else
    echo "❌ tailwind.config.ts НЕ найден!"
fi

if [ -f "src/app/globals.css" ]; then
    echo "✅ globals.css найден"
else
    echo "❌ globals.css НЕ найден!"
fi

if [ -f "postcss.config.js" ]; then
    echo "✅ postcss.config.js найден"
else
    echo "❌ postcss.config.js НЕ найден - создаем..."
    cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
    echo "✅ postcss.config.js создан"
fi

# Проверяем package.json
echo ""
echo "📦 Проверка зависимостей:"

if grep -q "tailwindcss" package.json; then
    echo "✅ tailwindcss установлен"
else
    echo "❌ tailwindcss НЕ установлен!"
fi

if grep -q "tailwindcss-animate" package.json; then
    echo "✅ tailwindcss-animate установлен"
else
    echo "❌ tailwindcss-animate НЕ установлен - устанавливаем..."
    npm install tailwindcss-animate
fi

# Переустанавливаем зависимости
echo ""
echo "🔄 Переустановка зависимостей..."
rm -rf node_modules package-lock.json
npm install

# Очищаем кеш Next.js
echo "🧹 Очистка кеша Next.js..."
rm -rf .next

echo ""
echo "🎨 Переинициализация shadcn/ui..."
echo "Выполните следующие команды:"
echo "npx shadcn@latest init --yes"
echo "npx shadcn@latest add button card dialog form input label select textarea badge avatar"

echo ""
echo "🚀 Готово! Теперь запустите:"
echo "npm run dev"

echo ""
echo "🔍 Если стили все еще не работают, проверьте:"
echo "1. Импорт globals.css в layout.tsx"
echo "2. Содержимое tailwind.config.ts"
echo "3. CSS переменные в globals.css"
echo "4. Работу DevTools в браузере"