"use client"

import { Toaster as SonnerToaster } from "sonner"

export const Toast = () => {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius)",
        },
      }}
    />
  )
}
