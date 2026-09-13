import { Monitor } from "lucide-react";

export function MobileBlocker() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 bg-[#0a0a0a] px-8 text-center">
      <Monitor className="h-8 w-8 text-blue-300/70" />
      <div>
        <h1 className="text-base font-medium text-white/80">Open Forge on a larger screen</h1>
        <p className="mt-2 text-sm text-white/35">The workspace editor is available on desktop.</p>
      </div>
    </div>
  );
}
