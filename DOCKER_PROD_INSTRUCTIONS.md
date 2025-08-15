# Запуск приложения в Docker Compose Production режиме

Для запуска приложения Taskella в production режиме с использованием Docker Compose выполните следующие шаги:

## 1. Подготовка окружения

Убедитесь, что у вас установлены:
- Docker
- Docker Compose

## 2. Настройка переменных окружения

Создайте и настройте файл `.env.production`:

```bash
cp .env.production .env.production.local
```

Отредактируйте файл `.env.production.local`, заменив значения на ваши реальные данные:

```env
# JWT Secret для токенов (сгенерируйте надежный секрет)
# Генерация: openssl rand -base64 32
JWT_SECRET=your-production-secret-key-here

# Telegram Bot Token (получите от @BotFather)
# 1. Найдите @BotFather в Telegram
# 2. Отправьте команду /newbot
# 3. Следуйте инструкциям для создания бота
# 4. Скопируйте полученный токен
# ВАЖНО: Токен содержит двоеточие, передавайте как есть, без кавычек
# Пример: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# URL вашего production приложения
# Замените на ваш домен или IP адрес
NEXT_PUBLIC_APP_URL=http://your-production-url.com

# Режим production (отключает функции для тестирования)
NEXT_PUBLIC_DEV_MODE=false

# API URL для production
# Должен соответствовать NEXT_PUBLIC_APP_URL + /api
NEXT_PUBLIC_API_BASE_URL=http://your-production-url.com/api

# Имя Telegram бота
# Имя, которое вы дали боту при создании
NEXT_PUBLIC_TELEGRAM_BOT_NAME=YourTaskTrackerBot

# База данных SQLite
# Путь к файлу базы данных в контейнере
DATABASE_URL=file:./data/sqlite.db
```

### Важные замечания по безопасности:

1. **JWT_SECRET**:
   - Сгенерируйте уникальный секрет: `openssl rand -base64 32`
   - Никогда не используйте значение по умолчанию
   - Длина должна быть не менее 32 символов

2. **TELEGRAM_BOT_TOKEN**:
   - Получите токен от @BotFather в Telegram
   - Токен выглядит как: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **ВАЖНО**: Передавайте токен как есть, без кавычек, даже если он содержит двоеточие
   - Храните в секрете, не публикуйте в репозитории

3. **Файл .env.production.local**:
   - Добавьте в `.gitignore` чтобы избежать попадания в репозиторий
   - Права доступа: `chmod 600 .env.production.local`

## 3. Сборка и запуск приложения

Выполните следующую команду для сборки и запуска приложения в production режиме:

```bash
# Сначала создайте файл с переменными окружения
cp .env.production .env.production.local
# Отредактируйте .env.production.local с вашими реальными данными

# Затем соберите и запустите приложение
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

Проверьте состояние базы данных:
```bash
curl http://localhost:3000/api/init-db
```

Принудительно инициализируйте базу данных (если нужно):
```bash
curl -X POST http://localhost:3000/api/init-db \
  -H "x-init-secret: dev-init-secret"
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