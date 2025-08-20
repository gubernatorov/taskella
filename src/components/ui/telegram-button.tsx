'use client'

import React from 'react'
import { Button as TelegramButton } from '@telegram-apps/telegram-ui'

interface TelegramUIButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  asChild?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function TelegramUIButton({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  className,
  ...props
}: TelegramUIButtonProps) {
  const getButtonVariant = () => {
    switch (variant) {
      case 'primary':
        return 'filled'
      case 'secondary':
      case 'outline':
        return 'outlined' 
      case 'ghost':
        return 'plain'
      case 'destructive':
        return 'filled'
      default:
        return 'filled'
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 's'
      case 'md':
        return 'm'
      case 'lg':
        return 'l'
      default:
        return 'm'
    }
  }

  return (
    <TelegramButton
      size={getButtonSize()}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        backgroundColor: variant === 'destructive' ? 'var(--tg-theme-destructive-text-color, #ff3333)' :
                         variant === 'primary' ? 'var(--tg-theme-button-color, #3390ec)' :
                         variant === 'secondary' ? 'var(--tg-theme-secondary-bg-color, #f1f3f4)' :
                         undefined,
        color: variant === 'destructive' || variant === 'primary' ? 'var(--tg-theme-button-text-color, #ffffff)' :
               'var(--tg-theme-text-color, #000000)',
        border: variant === 'outline' ? '1px solid var(--tg-theme-button-color, #3390ec)' : undefined
      }}
      {...props}
    >
      {children}
    </TelegramButton>
  )
}