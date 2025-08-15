import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "glass-subtle file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary selection:text-primary-foreground border-white/20 flex h-9 w-full min-w-0 rounded-lg border px-3 py-2 text-base shadow-glass-sm transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-primary/60 focus-visible:ring-primary/40 focus-visible:ring-[3px] focus-visible:shadow-glass focus-visible:scale-[1.02] focus-visible:backdrop-blur-[12px]",
        "hover:border-white/30 hover:shadow-glass-sm hover:backdrop-blur-[10px]",
        "aria-invalid:ring-destructive/30 dark:aria-invalid:ring-destructive/50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
