"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface FullScreenLoadingProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "branded";
}

export default function FullScreenLoading({
  message = "Loading...",
  className,
  size = "md",
  variant = "default",
}: FullScreenLoadingProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
          className,
        )}
      >
        <Loader2
          className={cn("animate-spin text-primary", sizeClasses[size])}
        />
      </div>
    );
  }

  if (variant === "branded") {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background",
          className,
        )}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative rounded-full bg-primary/10 p-6">
              <Loader2
                className={cn("animate-spin text-primary", sizeClasses[size])}
              />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2
              className={cn(
                "font-semibold text-foreground",
                textSizeClasses[size],
              )}
            >
              Finance Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2
            className={cn("animate-spin text-primary", sizeClasses[size])}
          />
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
        </div>
        <p
          className={cn(
            "font-medium text-foreground animate-pulse",
            textSizeClasses[size],
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
