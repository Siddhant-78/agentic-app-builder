import { Monitor } from "lucide-react";

export function MobileBlocker() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 bg-background px-8 text-center">
      <Monitor className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-base font-medium text-foreground">Open Nexa on a larger screen</h1>
        <p className="mt-2 text-sm text-muted-foreground">The workspace editor is available on desktop.</p>
      </div>
    </div>
  );
}
