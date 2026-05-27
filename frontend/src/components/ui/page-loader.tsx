export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-forest-500 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-3 w-3 rounded-full bg-forest-500 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-3 w-3 rounded-full bg-forest-500 animate-bounce" style={{ animationDelay: "300ms" }} />
      </span>
    </div>
  );
}
