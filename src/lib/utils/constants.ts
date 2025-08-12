export const TASK_STATUSES = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  in_review: 'На проверке',
  done: 'Выполнено',
  cancelled: 'Отменено',
} as const

export const TASK_PRIORITIES = {
  lowest: 'Самый низкий',
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  highest: 'Критический',
} as const

export const TASK_TYPES = {
  task: 'Задача',
  bug: 'Ошибка',
  feature: 'Новая функция',
  epic: 'Эпик',
  story: 'История',
} as const

export const PROJECT_STATUSES = {
  active: 'Активный',
  archived: 'Архивный',
  suspended: 'Приостановлен',
} as const