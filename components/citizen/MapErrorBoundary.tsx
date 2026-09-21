"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[500px] flex-col items-center justify-center gap-2 rounded-xl2 border border-surface-line bg-surface-raised text-center">
          <AlertTriangle className="h-6 w-6 text-status-high" strokeWidth={2} />
          <p className="text-sm font-semibold text-ink-900">Unable to load the map.</p>
          <p className="text-sm text-ink-700/60">
            Please refresh the page and try again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
