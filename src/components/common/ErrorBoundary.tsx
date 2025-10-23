"use client"

import type React from "react"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="card max-w-md text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()} className="btn-primary w-full">
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
