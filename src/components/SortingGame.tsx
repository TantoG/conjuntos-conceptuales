import { useState, useEffect } from "react";
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

interface GameData {
  titulo: string;
  descripcion:string;
  grupos: {
    grupoA: {
      nombre: string;
      conceptos_correctos: string[];
    };
    grupoB: {
      nombre: string;
      conceptos_correctos: string[];
    }
  }
}


// Shuffle function
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface SortingGameProps {
  gameData: GameData;
  onNext: () => void;
  onFinish: (results: any) => void;
  colorScheme: "green" | "red";
  isLastQuestion: boolean;
}

export const SortingGame = ({ gameData, onNext, onFinish, colorScheme, isLastQuestion }: SortingGameProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [groupA, setGroupA] = useState<string[]>([]);
  const [groupB, setGroupB] = useState<string[]>([]);
  const [sortZone, setSortZone] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const [regretFactor, setRegretFactor] = useState(0);

  useEffect(() => {
    // Reset state when gameData changes
    setGroupA([]);
    setGroupB([]);
    setScore(null);
    setElapsedTime(null);
    setRegretFactor(0);

    const groupAConcepts = gameData.grupos.grupoA.conceptos_correctos.map((concepto: string, index: number) => ({
      id: `a${index + 1}`,
      label: concepto,
      correctGroup: 'A' as const
    }));
    const groupBConcepts = gameData.grupos.grupoB.conceptos_correctos.map((concepto: string, index: number) => ({
      id: `b${index + 1}`,
      label: concepto,
      correctGroup: 'B' as const
    }));

    const allItems = shuffleArray([...groupAConcepts, ...groupBConcepts]);
    setItems(allItems);
    setSortZone(allItems.map(item => item.id));
    setStartTime(Date.now());
    calculateScore([], [], allItems);
  }, [gameData]);

  const calculateScore = (currentGroupA: string[], currentGroupB: string[], currentItems: Item[]) => {
    if (startTime) {
      setElapsedTime(Date.now() - startTime);
    }

    let correctCount = 0;
    const totalItems = currentItems.length;

    currentGroupA.forEach((itemId) => {
      const item = currentItems.find((i) => i.id === itemId);
      if (item?.correctGroup === "A") correctCount++;
    });

    currentGroupB.forEach((itemId) => {
      const item = currentItems.find((i) => i.id === itemId);
      if (item?.correctGroup === "B") correctCount++;
    });

    const finalScore = totalItems > 0 ? (correctCount / totalItems) * 10 : 0;
    setScore(Math.round(finalScore * 10) / 10);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const itemId = active.id as string;
    const targetZone = over.id as string;

    const isMovingFromGroup = groupA.includes(itemId) || groupB.includes(itemId);

    if (isMovingFromGroup) {
      setRegretFactor(prev => prev + 1);
    }

    let newGroupA = [...groupA];
    let newGroupB = [...groupB];
    let newSortZone = [...sortZone];

    // Remove from all zones
    newGroupA = newGroupA.filter((id) => id !== itemId);
    newGroupB = newGroupB.filter((id) => id !== itemId);
    newSortZone = newSortZone.filter((id) => id !== itemId);

    // Add to target zone
    if (targetZone === "groupA") {
      newGroupA.push(itemId);
    } else if (targetZone === "groupB") {
      newGroupB.push(itemId);
    } else if (targetZone === "sortZone") {
      newSortZone.push(itemId);
    }

    setGroupA(newGroupA);
    setGroupB(newGroupB);
    setSortZone(newSortZone);
    calculateScore(newGroupA, newGroupB, items);
  };



  const resetGame = () => {
    setSortZone(shuffleArray(items).map((item) => item.id));
    setGroupA([]);
    setGroupB([]);
    setScore(null);
    setStartTime(Date.now());
    setElapsedTime(null);
    setRegretFactor(0);
    setIsSubmitted(false);
  };

  const handleNext = () => {
    onFinish({ score, elapsedTime, regretFactor });
    onNext();
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background py-12 px-4" data-color-scheme={colorScheme}>
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">{gameData?.titulo}</h1>
            <p className="text-muted-foreground text-lg">
              {gameData?.descripcion}
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <DroppableZone id="groupA" title={gameData?.grupos.grupoA.nombre || 'Grupo A'} variant="a" colorScheme={colorScheme}>
              {groupA.map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                return item ? (
                  <DraggableItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    group={item.correctGroup}
                    colorScheme={colorScheme}
                  />
                ) : null;
              })}
            </DroppableZone>

            <DroppableZone id="groupB" title={gameData?.grupos.grupoB.nombre || 'Grupo B'} variant="b" colorScheme={colorScheme}>
              {groupB.map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                return item ? (
                  <DraggableItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    group={item.correctGroup}
                    colorScheme={colorScheme}
                  />
                ) : null;
              })}
            </DroppableZone>
          </div>

          <div className="mb-12">
            <DroppableZone id="sortZone" title="CONCEPTOS" variant="sort" colorScheme={colorScheme}>
              {sortZone.map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                return item ? (
                  <DraggableItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    group={item.correctGroup}
                    colorScheme={colorScheme}
                  />
                ) : null;
              })}
            </DroppableZone>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
              <Button
                onClick={resetGame}
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg font-semibold rounded-full"
              >
                Reiniciar
              </Button>
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold rounded-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300"
                disabled={sortZone.length > 0}
              >
                {isLastQuestion ? "Finalizar" : "Próximo"}
              </Button>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-[var(--shadow-soft)] animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-center text-foreground mb-4">Resultados</h2>
              <p className="text-2xl font-bold text-center text-foreground">
                Puntaje: <span className="text-primary">{score}/10</span>
              </p>
              <p className="text-xl text-center text-muted-foreground mt-2">
                Tiempo de respuesta: {elapsedTime ? Math.round(elapsedTime / 1000) : 0} segundos
              </p>
              <p className="text-xl text-center text-muted-foreground mt-2">
                Factor de arrepentimiento: {regretFactor}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};
