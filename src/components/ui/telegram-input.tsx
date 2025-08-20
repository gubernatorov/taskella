"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TelegramInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  variant?: "default" | "transparent"
  inputSize?: "sm" | "default" | "lg"
}

function TelegramInput({
  className,
  type,
  variant = "default",
  inputSize = "default",
  ...props
}: TelegramInputProps) {
  return (
    <input
      type={type}
      data-slot="telegram-input"
      data-variant={variant}
      data-size={inputSize}
      className={cn(
        // Базовые стили
        "w-full border-0 outline-none transition-all duration-200",
        "text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        
        // Варианты фона
        variant === "default" && [
          "bg-[var(--tg-theme-secondary-bg-color)] rounded-xl",
          "focus:bg-[var(--tg-theme-bg-color)] focus:shadow-sm",
          "hover:bg-[var(--tg-theme-bg-color)]"
        ],
        variant === "transparent" && [
          "bg-transparent border-b border-[var(--tg-theme-hint-color)]/20",
          "focus:border-[var(--tg-theme-button-color)] focus:border-b-2",
          "hover:border-[var(--tg-theme-hint-color)]/40"
        ],
        
        // Размеры
        inputSize === "sm" && "px-3 py-2 text-sm",
        inputSize === "default" && "px-4 py-3 text-base",
        inputSize === "lg" && "px-4 py-4 text-lg",
        
        // Специальные стили для file input
        "file:border-0 file:bg-transparent file:text-[var(--tg-theme-text-color)]",
        "file:text-sm file:font-medium file:mr-4",
        
        className
      )}
      {...props}
    />
  )
}

export { TelegramInput }