import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableZoneProps {
  id: string;
  title: string;
  children: ReactNode;
  variant: "a" | "b" | "sort";
}

export const DroppableZone = ({ id, title, children, variant }: DroppableZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const getColors = () => {
    switch (variant) {
      case "a":
        return {
          bg: "bg-[hsl(var(--group-a-light))]",
          border: "border-[hsl(var(--group-a))]",
          text: "text-[hsl(var(--group-a))]",
        };
      case "b":
        return {
          bg: "bg-[hsl(var(--group-b-light))]",
          border: "border-[hsl(var(--group-b))]",
          text: "text-[hsl(var(--group-b))]",
        };
      case "sort":
        return {
          bg: "bg-[hsl(var(--group-sort-light))]",
          border: "border-[hsl(var(--group-sort))]",
          text: "text-[hsl(var(--group-sort))]",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <h2 className={`text-2xl font-bold ${colors.text}`}>{title}</h2>
      <div
        ref={setNodeRef}
        className={`${colors.bg} ${colors.border} border-4 rounded-[100px] p-8 min-h-[250px] w-full max-w-md flex flex-wrap gap-3 justify-center items-center transition-all duration-300 ${
          isOver ? "scale-105 shadow-[var(--shadow-hover)]" : "shadow-[var(--shadow-soft)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
};
