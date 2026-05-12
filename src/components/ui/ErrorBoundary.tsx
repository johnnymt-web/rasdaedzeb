import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name || "Component"}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="card-warm p-8 text-center border-dashed border-2 flex flex-col items-center justify-center min-h-[200px]">
          <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="font-heading font-semibold text-foreground mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            We encountered an issue while rendering this section.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => this.setState({ hasError: false })}
            className="gap-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
