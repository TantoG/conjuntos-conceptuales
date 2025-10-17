import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableItemProps {
  id: string;
  label: string;
  group: "A" | "B";
}

export const DraggableItem = ({ id, label, group }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const bgColor = group === "A" ? "bg-[hsl(var(--group-a))]" : "bg-[hsl(var(--group-b))]";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${bgColor} text-black px-6 py-3 rounded-full cursor-grab active:cursor-grabbing transition-all duration-300 hover:scale-105 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] font-medium`}
    >
      {label}
    </div>
  );
};
