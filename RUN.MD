# Сборка образа
docker build -t taskella .

# Запуск с docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Или запуск напрямую
docker run -p 3000:3000 -v taskella_data:/app/data taskella