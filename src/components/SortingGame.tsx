import { useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { DraggableItem } from "./DraggableItem";
import { DroppableZone } from "./DroppableZone";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface Item {
  id: string;
  label: string;
  correctGroup: "A" | "B";
}

const initialItems: Item[] = [
  { id: "a1", label: "Grupo A1", correctGroup: "A" },
  { id: "a2", label: "Grupo A2", correctGroup: "A" },
  { id: "a3", label: "Grupo A3", correctGroup: "A" },
  { id: "a4", label: "Grupo A4", correctGroup: "A" },
  { id: "a5", label: "Grupo A5", correctGroup: "A" },
  { id: "b1", label: "Grupo B1", correctGroup: "B" },
  { id: "b2", label: "Grupo B2", correctGroup: "B" },
  { id: "b3", label: "Grupo B3", correctGroup: "B" },
  { id: "b4", label: "Grupo B4", correctGroup: "B" },
  { id: "b5", label: "Grupo B5", correctGroup: "B" },
];

// Shuffle function
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const SortingGame = () => {
  const [items] = useState<Item[]>(shuffleArray(initialItems));
  const [groupA, setGroupA] = useState<string[]>([]);
  const [groupB, setGroupB] = useState<string[]>([]);
  const [sortZone, setSortZone] = useState<string[]>(items.map((item) => item.id));
  const [score, setScore] = useState<number | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const itemId = active.id as string;
    const targetZone = over.id as string;

    // Remove from all zones
    setGroupA((prev) => prev.filter((id) => id !== itemId));
    setGroupB((prev) => prev.filter((id) => id !== itemId));
    setSortZone((prev) => prev.filter((id) => id !== itemId));

    // Add to target zone
    if (targetZone === "groupA") {
      setGroupA((prev) => [...prev, itemId]);
    } else if (targetZone === "groupB") {
      setGroupB((prev) => [...prev, itemId]);
    } else if (targetZone === "sortZone") {
      setSortZone((prev) => [...prev, itemId]);
    }

    setScore(null);
  };

  const calculateScore = () => {
    let correctCount = 0;
    const totalItems = items.length;

    groupA.forEach((itemId) => {
      const item = items.find((i) => i.id === itemId);
      if (item?.correctGroup === "A") correctCount++;
    });

    groupB.forEach((itemId) => {
      const item = items.find((i) => i.id === itemId);
      if (item?.correctGroup === "B") correctCount++;
    });

    const finalScore = (correctCount / totalItems) * 10;
    setScore(Math.round(finalScore * 10) / 10);

    if (finalScore === 10) {
      toast.success("¡Perfecto! Todos los conceptos están correctamente ordenados.");
    } else if (finalScore === 0) {
      toast.error("Ningún concepto está en el lugar correcto. ¡Inténtalo de nuevo!");
    } else {
      toast.info(`Has acertado ${correctCount} de ${totalItems} conceptos.`);
    }
  };

  const resetGame = () => {
    setSortZone(shuffleArray(items).map((item) => item.id));
    setGroupA([]);
    setGroupB([]);
    setScore(null);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">Juego de Ordenamiento</h1>
            <p className="text-muted-foreground text-lg">
              Arrastra los conceptos a su grupo correspondiente
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <DroppableZone id="groupA" title="GRUPO A" variant="a">
              {groupA.map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                return item ? (
                  <DraggableItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    group={item.correctGroup}
                  />
                ) : null;
              })}
            </DroppableZone>

            <DroppableZone id="groupB" title="GRUPO B" variant="b">
              {groupB.map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                return item ? (
                  <DraggableItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    group={item.correctGroup}
                  />
                ) : null;
              })}
            </DroppableZone>
          </div>

          <div className="mb-12">
            <DroppableZone id="sortZone" title="ORDENAR" variant="sort">
              {sortZone.map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                return item ? (
                  <DraggableItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    group={item.correctGroup}
                  />
                ) : null;
              })}
            </DroppableZone>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
              <Button
                onClick={calculateScore}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold rounded-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300"
              >
                Listo
              </Button>
              <Button
                onClick={resetGame}
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg font-semibold rounded-full"
              >
                Reiniciar
              </Button>
            </div>

            {score !== null && (
              <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-[var(--shadow-soft)] animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <p className="text-3xl font-bold text-center text-foreground">
                  Puntaje: <span className="text-primary">{score}/10</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
};
