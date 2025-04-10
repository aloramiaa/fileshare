"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          {...props}
          className="dystopian-card border-[rgba(var(--toxic-red-rgb),0.5)] backdrop-blur-md scan-lines"
        >
          <div className="grid gap-1">
            {title && <ToastTitle className="toxic-text font-mono">{title}</ToastTitle>}
            {description && <ToastDescription className="text-gray-400 font-mono">{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose className="text-gray-400 hover:text-[hsl(var(--toxic-red))]" />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
