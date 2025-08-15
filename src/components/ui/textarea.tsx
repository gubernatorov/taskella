import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "bg-background/80 backdrop-blur-sm border-border/50 placeholder:text-muted-foreground/70 focus-visible:border-ring/50 focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-sm transition-all duration-300 outline-none focus-visible:ring-[3px] focus-visible:shadow-md focus-visible:scale-[1.01] hover:border-border/70 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
