"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-8">
          <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
          <p className="text-sm text-slate-500">{this.state.error?.message}</p>
          <Button onClick={() => this.setState({ hasError: false })}>Retry</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
