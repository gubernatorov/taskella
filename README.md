# 📋 Taskella

<div align="center">

**Современная система управления задачами с поддержкой Kanban и Scrum досок**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/username/taskella)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/username/taskella)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)

<!-- 🎬 Место для GIF демонстрации приложения -->
<div style="margin: 20px 0;">
  <img src="https://via.placeholder.com/800x400/2D3748/FFFFFF?text=🎬+Demo+GIF+%E2%80%A2+Drag+%26+Drop+Task+Management" alt="Taskella Demo" />
</div>

[🚀 Демо](https://taskella-demo.vercel.app) • [📖 Документация](https://docs.taskella.app) • [🐛 Сообщить об ошибке](https://github.com/username/taskella/issues)

</div>

## ✨ Возможности

- 🎯 **Kanban и Scrum доски** - Гибкое управление задачами с drag-and-drop
- 📝 **Детальные задачи** - Описания, комментарии, вложения и временные метки
- 👥 **Управление проектами** - Организация команд и распределение ролей  
- 🏷️ **Система типов и приоритетов** - Task, Bug, Feature, Epic, Story
- 📊 **Отслеживание времени** - Логирование и оценка времени выполнения
- 💬 **Комментарии** - Обсуждения и обратная связь по задачам
- 📎 **Вложения** - Прикрепление файлов к задачам
- 🔐 **Telegram авторизация** - Удобный вход через Telegram
- 🎨 **Glass-morphism дизайн** - Современный и элегантный интерфейс
- 📱 **Адаптивный дизайн** - Работает на всех устройствах

## 🛠️ Технологический стек

### Frontend
- **[Next.js 14](https://nextjs.org)** - React фреймворк с App Router
- **[TypeScript](https://typescriptlang.org)** - Типизированный JavaScript
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS фреймворк
- **[Framer Motion](https://framer.com/motion)** - Анимации и переходы
- **[Radix UI](https://radix-ui.com)** - Headless UI компоненты
- **[Lucide React](https://lucide.dev)** - Иконки

### Backend & Database  
- **[SQLite](https://sqlite.org)** - Легковесная реляционная БД
- **[Drizzle ORM](https://orm.drizzle.team)** - Type-safe ORM
- **[Better SQLite3](https://github.com/WiseLibs/better-sqlite3)** - Node.js SQLite драйвер

### Состояние и API
- **[TanStack Query](https://tanstack.com/query)** - Управление серверным состоянием
- **[Zustand](https://zustand-demo.pmnd.rs)** - Легковесный state manager
- **[React Hook Form](https://react-hook-form.com)** - Управление формами
- **[Zod](https://zod.dev)** - Валидация схем

### Интеграции
- **[Telegram Mini Apps](https://core.telegram.org/bots/webapps)** - Telegram SDK
- **[@hello-pangea/dnd](https://github.com/hello-pangea/dnd)** - Drag and Drop

### DevOps
- **[Docker](https://docker.com)** - Контейнеризация
- **[ESLint](https://eslint.org)** - Линтер кода

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm, yarn, pnpm или bun

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/username/taskella.git
cd taskella
```

2. **Установите зависимости**
```bash
npm install
# или
yarn install
# или
pnpm install
```

3. **Настройте переменные окружения**
```bash
cp .env.example .env.local
```

4. **Инициализируйте базу данных**
```bash
npm run db:migrate
npm run db:seed
```

5. **Запустите сервер разработки**
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### 🐳 Docker

```bash
# Сборка и запуск в production режиме
docker-compose -f docker-compose.prod.yml up --build

# Или используйте готовый образ
docker pull taskella:latest
docker run -p 3000:3000 taskella:latest
```

## 📚 Структура проекта

```
taskella/
├── src/
│   ├── app/                    # Next.js App Router страницы
│   │   ├── api/               # API эндпоинты
│   │   ├── boards/            # Kanban/Scrum доски
│   │   ├── projects/          # Управление проектами
│   │   └── tasks/             # Управление задачами
│   ├── components/            # React компоненты
│   │   ├── boards/            # Компоненты досок
│   │   ├── tasks/             # Компоненты задач
│   │   └── ui/                # UI библиотека
│   ├── lib/                   # Утилиты и хелперы
│   │   ├── api/               # API клиенты
│   │   ├── db/                # База данных и схемы
│   │   └── hooks/             # React хуки
│   └── types/                 # TypeScript типы
├── public/                    # Статические файлы
├── scripts/                   # Скрипты автоматизации
└── docker-compose.prod.yml    # Docker конфигурация
```

## 🎯 Использование

### Создание проекта
1. Перейдите в раздел "Проекты"
2. Нажмите "Создать проект"
3. Заполните информацию о проекте

### Управление задачами
1. Создайте задачу с описанием и приоритетом
2. Назначьте исполнителя
3. Используйте Kanban доску для отслеживания прогресса
4. Добавляйте комментарии и вложения

### Работа с досками
- **Kanban**: Перетаскивайте карточки между колонками статусов
- **Scrum**: Планируйте спринты и отслеживайте velocity

## 📈 Статусы задач

- **📝 Todo** - Задача создана, ожидает выполнения
- **⚡ In Progress** - Задача в работе
- **👀 In Review** - На проверке
- **✅ Done** - Выполнена
- **❌ Cancelled** - Отменена

## 🏷️ Типы задач

- **📋 Task** - Обычная задача
- **🐛 Bug** - Исправление ошибки  
- **⭐ Feature** - Новая функциональность
- **📚 Epic** - Большая задача из нескольких подзадач
- **📖 Story** - Пользовательская история

## 🤝 Вклад в проект

Мы приветствуем ваш вклад! Пожалуйста, ознакомьтесь с [руководством по участию](CONTRIBUTING.md).

1. Сделайте Fork проекта
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Changelog

См. [CHANGELOG.md](CHANGELOG.md) для истории изменений.

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для подробностей.

## 📞 Поддержка

- 📧 Email: support@taskella.ru
- 💬 Telegram: [@taskella_bot](https://t.me/taskella_bot)  
- 🐛 Issues: [GitHub Issues](https://github.com/gubernatorov/taskella/issues)
- 💡 Идеи: [GitHub Discussions](https://github.com/gubernatorov/taskella/discussions)

---

<div align="center">
  <p>Сделано с ❤️ командой Taskella</p>
  <p>
    <a href="https://github.com/gubernatorov/taskella">⭐ Star на GitHub</a> •
    <a href="https://taskella.app/blog">📝 Blog</a>
  </p>
</div>
