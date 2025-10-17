import { useState, useEffect } from "react";
import { SortingGame } from "./SortingGame";

interface GameData {
  actividad: {
    titulo: string;
    descripcion: string;
    grupos: {
      grupoA: {
        nombre: string;
        conceptos_correctos: string[];
      };
      grupoB: {
        nombre: string;
        conceptos_correctos: string[];
      };
    };
  };
}

export const Exam = () => {
  const [gameData, setGameData] = useState<GameData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/nubes_de_conceptos/tema_CPU_GPU.json").then((res) => res.json()),
      fetch("/nubes_de_conceptos/tema_BitMap vs Procedural.json").then((res) => res.json()),
    ]).then((data) => {
      setGameData(data);
      setIsLoading(false);
    });
  }, []);

  const handleNext = () => {
    if (currentQuestionIndex < gameData.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinish = (result: any) => {
    setResults((prev) => [...prev, result]);
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 text-foreground">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-12">Resumen de la Evaluación</h1>
          {results.map((result, index) => (
            <div key={index} className="bg-card border-2 border-border rounded-2xl p-8 shadow-[var(--shadow-soft)] mb-8">
              <h2 className="text-3xl font-bold text-center text-foreground mb-4">{gameData[index].actividad.titulo}</h2>
              <p className="text-2xl font-bold text-center text-foreground">
                Puntaje: <span className="text-primary">{result.score}/10</span>
              </p>
              <p className="text-xl text-center text-muted-foreground mt-2">
                Tiempo de respuesta: {result.elapsedTime ? Math.round(result.elapsedTime / 1000) : 0} segundos
              </p>
              <p className="text-xl text-center text-muted-foreground mt-2">
                Factor de arrepentimiento: {result.regretFactor}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SortingGame
      gameData={gameData[currentQuestionIndex].actividad}
      onNext={handleNext}
      onFinish={handleFinish}
      colorScheme={currentQuestionIndex === 0 ? "green" : "red"}
      isLastQuestion={currentQuestionIndex === gameData.length - 1}
    />
  );
};
