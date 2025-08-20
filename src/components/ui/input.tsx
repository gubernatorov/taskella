import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Базовые стили с Telegram переменными
        "flex h-9 w-full min-w-0 rounded-xl border-0 px-4 py-3 text-base outline-none transition-all duration-200",
        "bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)]",
        "placeholder:text-[var(--tg-theme-hint-color)] selection:bg-[var(--tg-theme-button-color)] selection:text-[var(--tg-theme-button-text-color)]",
        
        // Состояния
        "hover:bg-[var(--tg-theme-bg-color)] focus:bg-[var(--tg-theme-bg-color)] focus:shadow-sm",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        
        // Стили для file input
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-[var(--tg-theme-text-color)]",
        "file:text-sm file:font-medium file:mr-4",
        
        // Состояние ошибки
        "aria-invalid:bg-[var(--tg-theme-destructive-text-color)]/10 aria-invalid:border-[var(--tg-theme-destructive-text-color)]/30",
        
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
