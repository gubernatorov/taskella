# Запуск приложения в Docker Compose Production режиме

Для запуска приложения Taskella в production режиме с использованием Docker Compose выполните следующие шаги:

## 1. Подготовка окружения

Убедитесь, что у вас установлены:
- Docker
- Docker Compose

## 2. Настройка переменных окружения

Создайте и настройте файл `.env.production`:

```bash
cp .env.production.example .env.production
```

Отредактируйте файл `.env.production`, заменив значения на ваши реальные данные:

```env
# JWT Secret для токенов (сгенерируйте надежный секрет)
JWT_SECRET=your-production-secret-key-here

# Telegram Bot Token (получите от @BotFather)
TELEGRAM_BOT_TOKEN=your-production-bot-token-here

# URL вашего production приложения
NEXT_PUBLIC_APP_URL=http://your-production-url.com

# Режим production (отключает функции для тестирования)
NEXT_PUBLIC_DEV_MODE=false

# API URL для production
NEXT_PUBLIC_API_BASE_URL=http://your-production-url.com/api

# Имя Telegram бота
NEXT_PUBLIC_TELEGRAM_BOT_NAME=YourTaskTrackerBot

# База данных SQLite
DATABASE_URL=file:./data/sqlite.db
```

## 3. Сборка и запуск приложения

Выполните следующую команду для сборки и запуска приложения в production режиме:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Где:
- `-f docker-compose.prod.yml` - указывает использовать production конфигурацию
- `--build` - принудительно пересобрать образ перед запуском
- `-d` - запустить в фоновом режиме (detached)

## 4. Проверка работы приложения

Проверьте статус контейнера:
```bash
docker compose -f docker-compose.prod.yml ps
```

Проверьте логи приложения:
```bash
docker compose -f docker-compose.prod.yml logs -f taskella
```

Проверьте доступность API:
```bash
curl http://localhost:3000/api/health
```

## 5. Остановка приложения

Для остановки приложения выполните:
```bash
docker compose -f docker-compose.prod.yml down
```

Для остановки и удаления томов (включая базу данных):
```bash
docker compose -f docker-compose.prod.yml down -v
```

## 6. Обновление приложения

Для обновления приложения до новой версии:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up --build -d
```

## Особенности production режима

- Приложение запускается с `NODE_ENV=production`
- Отключены функции отладки и разработки
- Оптимизирована производительность
- Настроено автоматическое перезапуск при сбоях
- Данные базы данных сохраняются в Docker томе

## Решение проблем

Если приложение не запускается, проверьте:
1. Все ли переменные окружения заданы в `.env.production`
2. Доступен ли Docker daemon
3. Не занят ли порт 3000 другим процессом
4. Логи контейнера: `docker compose -f docker-compose.prod.yml logs taskella`