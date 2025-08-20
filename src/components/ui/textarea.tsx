import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Базовые стили с Telegram переменными
        "flex min-h-16 w-full rounded-xl border-0 px-4 py-3 text-base outline-none transition-all duration-200 resize-none",
        "bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)]",
        "placeholder:text-[var(--tg-theme-hint-color)] selection:bg-[var(--tg-theme-button-color)] selection:text-[var(--tg-theme-button-text-color)]",
        
        // Состояния
        "hover:bg-[var(--tg-theme-bg-color)] focus:bg-[var(--tg-theme-bg-color)] focus:shadow-sm",
        "disabled:cursor-not-allowed disabled:opacity-50",
        
        // Состояние ошибки
        "aria-invalid:bg-[var(--tg-theme-destructive-text-color)]/10 aria-invalid:border-[var(--tg-theme-destructive-text-color)]/30",
        
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
