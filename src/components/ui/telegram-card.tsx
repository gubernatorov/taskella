'use client'

import React from 'react'
import { Section, Cell } from '@telegram-apps/telegram-ui'

interface TelegramCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

interface TelegramCardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface TelegramCardContentProps {
  children: React.ReactNode
  className?: string
}

interface TelegramCardTitleProps {
  children: React.ReactNode
  className?: string
}

interface TelegramCardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function TelegramCard({ children, className, style }: TelegramCardProps) {
  return (
    <div 
      className={className}
      style={{
        backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
        borderRadius: '12px',
        overflow: 'hidden',
        ...style
      }}
    >
      {children}
    </div>
  )
}

export function TelegramCardHeader({ children, className }: TelegramCardHeaderProps) {
  return (
    <div 
      className={className}
      style={{
        padding: '16px 16px 8px 16px',
        borderBottom: '1px solid var(--tg-theme-hint-color, #e0e0e0)'
      }}
    >
      {children}
    </div>
  )
}

export function TelegramCardContent({ children, className }: TelegramCardContentProps) {
  return (
    <div 
      className={className}
      style={{
        padding: '8px 16px 16px 16px'
      }}
    >
      {children}
    </div>
  )
}

export function TelegramCardTitle({ children, className }: TelegramCardTitleProps) {
  return (
    <h3 
      className={className}
      style={{
        fontSize: '18px',
        fontWeight: '600',
        color: 'var(--tg-theme-text-color, #000000)',
        margin: '0 0 4px 0'
      }}
    >
      {children}
    </h3>
  )
}

export function TelegramCardDescription({ children, className }: TelegramCardDescriptionProps) {
  return (
    <p 
      className={className}
      style={{
        fontSize: '14px',
        color: 'var(--tg-theme-hint-color, #999999)',
        margin: 0
      }}
    >
      {children}
    </p>
  )
}