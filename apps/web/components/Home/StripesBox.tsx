interface StripesBoxProps {
  children: React.ReactNode
}

const StripesBox = ({ children }: StripesBoxProps) => {
  return (
    <div className="flex-center relative h-[400px] w-full flex-1 border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/0.45)] lg:w-1/2">
      <div className="absolute -left-4 -top-4 size-4 border-b border-r border-dashed border-[hsl(var(--border))] before:absolute before:-bottom-1 before:-right-1 before:block before:size-2 before:rounded-full before:border before:border-[hsl(var(--border))] before:bg-[hsl(var(--card))] before:shadow-sm" />
      <div className="absolute -right-4 -top-4 size-4 border-b border-l border-dashed border-[hsl(var(--border))] before:absolute before:-bottom-1 before:-left-1 before:block before:size-2 before:rounded-full before:border before:border-[hsl(var(--border))] before:bg-[hsl(var(--card))] before:shadow-sm" />
      <div className="absolute -bottom-4 -left-4 size-4 border-r border-t border-dashed border-[hsl(var(--border))] before:absolute before:-right-1 before:-top-1 before:block before:size-2 before:rounded-full before:border before:border-[hsl(var(--border))] before:bg-[hsl(var(--card))] before:shadow-sm" />
      <div className="absolute -bottom-4 -right-4 size-4 border-l border-t border-dashed border-[hsl(var(--border))] before:absolute before:-left-1 before:-top-1 before:block before:size-2 before:rounded-full before:border before:border-[hsl(var(--border))] before:bg-[hsl(var(--card))] before:shadow-sm" />
      <div
        className="max-w-screen pointer-events-none absolute inset-0 z-0 size-full overflow-hidden object-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAZSURBVHgBxcghAQAAAIMw+pf+C+CZHLilebfsBfsvTewEAAAAAElFTkSuQmCC")`,
          backgroundSize: '6px 6px',
        }}
      />
      {children}
    </div>
  )
}

export default StripesBox
