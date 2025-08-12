'use client'

import { useTelegramContext } from '@/lib/providers/TelegramProvider'

export function useTelegram() {
  return useTelegramContext()
}