"use client"

import { Toaster } from "react-hot-toast"

export const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "rgb(var(--background))",
          color: "rgb(var(--foreground))",
          border: "1px solid rgb(var(--border))",
          borderRadius: "var(--radius)",
        },
        success: {
          style: {
            background: "rgb(34 197 94 / 0.1)",
            color: "rgb(22 163 74)",
          },
        },
        error: {
          style: {
            background: "rgb(239 68 68 / 0.1)",
            color: "rgb(220 38 38)",
          },
        },
      }}
    />
  )
}
