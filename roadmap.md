# Task Tracker - Полная структура файлов

## 📁 Создайте следующую структуру папок:

```
task-tracker/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── telegram/
│   │   │   │   │   └── route.ts
│   │   │   │   └── me/
│   │   │   │       └── route.ts
│   │   │   ├── projects/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── tasks/
│   │   │   │           └── route.ts
│   │   │   └── tasks/
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── select.tsx
│   │   │   ├── form.tsx
│   │   │   └── label.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Navigation.tsx
│   │   ├── projects/
│   │   │   └── ProjectCard.tsx
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── PriorityBadge.tsx
│   │   └── common/
│   │       ├── Loading.tsx
│   │       └── EmptyState.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   └── tasks.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProjects.ts
│   │   │   ├── useTasks.ts
│   │   │   └── useTelegram.ts
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── TelegramProvider.tsx
│   │   │   └── QueryProvider.tsx
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   └── constants.ts
│   │   └── db/
│   │       ├── mock-users.ts
│   │       ├── mock-projects.ts
│   │       └── mock-tasks.ts
│   └── types/
│       ├── auth.ts
│       ├── project.ts
│       ├── task.ts
│       └── api.ts
├── public/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json
└── README.md
```

## 📝 Шаги для создания проекта:

### 1. Инициализация проекта
```bash
npx create-next-app@latest task-tracker --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd task-tracker
```

### 2. Установка зависимостей
```bash
npm install @hookform/resolvers @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot @tanstack/react-query @telegram-apps/sdk class-variance-authority clsx date-fns framer-motion lucide-react react-hook-form tailwind-merge tailwindcss-animate zod zustand
```

### 3. Настройка shadcn/ui
```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog form input label select textarea badge avatar
```

### 4. Создание файлов
Скопируйте содержимое из всех созданных артефактов в соответствующие файлы:

#### 📄 Основные файлы из артефакта "Основные файлы Next.js приложения":
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/page.tsx`
- Все типы из `src/types/`

#### 🔧 Провайдеры и API из артефакта "Провайдеры и хуки":
- Все файлы из `src/lib/providers/`
- Все файлы из `src/lib/hooks/`
- Все файлы из `src/lib/api/`

#### 🎨 UI компоненты из артефактов "UI компоненты" и "Дополнительные UI компоненты":
- Все файлы из `src/components/ui/`
- Все файлы из `src/components/layout/`
- Все файлы из `src/components/tasks/`
- Все файлы из `src/components/common/`
- `src/lib/utils/cn.ts`
- `src/lib/utils/constants.ts`

#### 📋 Страницы из артефактов "Страницы проектов" и "Страницы задач":
- `src/app/(dashboard)/projects/page.tsx`
- `src/app/(dashboard)/projects/new/page.tsx`
- `src/app/(dashboard)/projects/[id]/page.tsx`
- `src/app/(dashboard)/tasks/page.tsx`
- `src/app/(dashboard)/tasks/[id]/page.tsx`
- `src/app/(dashboard)/tasks/new/page.tsx`

#### 🗄️ API и Mock данные из артефакта "API маршруты и mock данные":
- Все файлы из `src/app/api/`
- Все файлы из `src/lib/db/`

#### ⚙️ Конфигурация из артефакта "Конфигурация и базовые UI компоненты":
- `tailwind.config.ts`
- `components.json`
- `tsconfig.json`

### 5. Запуск проекта
```bash
npm run dev
```

### 6. Открытие в браузере
```
http://localhost:3000
```

## 🎯 API Swagger документация

Swagger спецификация находится в артефакте "Task Tracker API - OpenAPI Swagger" - скопируйте её в файл `api-spec.yaml` для документации API.

## 📱 Тестирование в Telegram

Для тестирования в Telegram WebApp:
1. Создайте бота через @BotFather
2. Настройте Menu Button или Web App
3. Укажите URL вашего приложения
4. Добавьте переменные окружения в `.env.local`

## 🔧 Переменные окружения

Создайте файл `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_TELEGRAM_BOT_NAME=YourTaskTrackerBot
```

Теперь у вас есть полнофункциональный таск-трекер для Telegram Mini Apps! 🎉