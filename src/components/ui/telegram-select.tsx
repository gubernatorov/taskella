"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDownIcon, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TelegramSelectProps extends React.ComponentProps<typeof SelectPrimitive.Root> {
  placeholder?: string
  variant?: "default" | "transparent"
  inputSize?: "sm" | "default" | "lg"
}

function TelegramSelect({
  children,
  placeholder,
  variant = "default",
  inputSize = "default",
  ...props
}: TelegramSelectProps) {
  return (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger
        data-slot="telegram-select-trigger"
        data-variant={variant}
        data-size={inputSize}
        className={cn(
          // Базовые стили
          "flex items-center justify-between w-full border-0 outline-none transition-all duration-200",
          "text-[var(--tg-theme-text-color)] cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          
          // Варианты фона
          variant === "default" && [
            "bg-[var(--tg-theme-secondary-bg-color)] rounded-xl",
            "hover:bg-[var(--tg-theme-bg-color)] focus:bg-[var(--tg-theme-bg-color)]",
            "data-[state=open]:bg-[var(--tg-theme-bg-color)]"
          ],
          variant === "transparent" && [
            "bg-transparent border-b border-[var(--tg-theme-hint-color)]/20",
            "hover:border-[var(--tg-theme-hint-color)]/40",
            "focus:border-[var(--tg-theme-button-color)] focus:border-b-2",
            "data-[state=open]:border-[var(--tg-theme-button-color)] data-[state=open]:border-b-2"
          ],
          
          // Размеры
          inputSize === "sm" && "px-3 py-2 text-sm",
          inputSize === "default" && "px-4 py-3 text-base",
          inputSize === "lg" && "px-4 py-4 text-lg"
        )}
      >
        <SelectPrimitive.Value 
          placeholder={placeholder}
          className="text-left truncate data-[placeholder]:text-[var(--tg-theme-hint-color)]"
        />
        <SelectPrimitive.Icon className="ml-2 flex-shrink-0">
          <ChevronDownIcon className="h-4 w-4 text-[var(--tg-theme-hint-color)]" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl",
            "bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/20",
            "shadow-lg backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2"
          )}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

interface TelegramSelectItemProps extends React.ComponentProps<typeof SelectPrimitive.Item> {
  children: React.ReactNode
}

function TelegramSelectItem({ 
  className, 
  children, 
  ...props 
}: TelegramSelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-3",
        "text-[var(--tg-theme-text-color)] text-sm outline-none",
        "hover:bg-[var(--tg-theme-secondary-bg-color)] focus:bg-[var(--tg-theme-secondary-bg-color)]",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "transition-colors duration-150",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex-1">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-2">
        <CheckIcon className="h-4 w-4 text-[var(--tg-theme-button-color)]" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function TelegramSelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("h-px bg-[var(--tg-theme-hint-color)]/20 mx-1 my-1", className)}
      {...props}
    />
  )
}

export { 
  TelegramSelect, 
  TelegramSelectItem, 
  TelegramSelectSeparator 
}