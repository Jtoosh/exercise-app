import type { Exercise } from "@/lib/exercise.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ChevronDown, ChevronUp, Dumbbell, Flame, Target, Layers, RefreshCw, CheckCircle2, Circle } from "lucide-react";
import { type ReactNode, useState } from "react";


interface Props {
    fetchedExercise: Exercise | null;
    logging?: ReactNode;
    exerciseIndex?: number;
    isCompleted?: boolean;
    onToggleCompleted?: () => void;
    onSwap?: () => Promise<void> | void;
}

export function ExerciseInfo({
    fetchedExercise,
    exerciseIndex,
    isCompleted = false,
    onToggleCompleted,
    onSwap,
    logging,
}: Props) {
    const [showAllSteps, setShowAllSteps] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [swapping, setSwapping] = useState(false);

    if (!fetchedExercise) return null;

    const instructions = fetchedExercise.instructions || [];
    const displayedSteps = showAllSteps ? instructions : instructions.slice(0, 3);
    const hasMoreSteps = instructions.length > 3;

    const img0 = fetchedExercise.getImageUrl(0);
    const img1 = fetchedExercise.getImageUrl(1);
    const hasImages = Boolean(img0 || img1);

    const activeImageUrl = fetchedExercise.getImageUrl(selectedImageIndex) || img0;

    const handleSwapClick = async () => {
        if (!onSwap || swapping) return;
        setSwapping(true);
        try {
            await onSwap();
        } finally {
            setSwapping(false);
        }
    };

    return (
        <Card
            className={`w-full max-w-3xl mx-auto overflow-hidden border bg-card shadow-sm transition-all duration-300 ${
                isCompleted ? "border-primary/40" : "border-border/50"
            }`}
        >
            {/* Header Toolbar: Completion Checkbox & Swap Button */}
            <div className="flex items-center justify-between px-6 pt-4 pb-1 border-b border-border/40 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                    {onToggleCompleted && (
                        <button
                            type="button"
                            onClick={onToggleCompleted}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                        >
                            {isCompleted ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>Completed</span>
                                </>
                            ) : (
                                <>
                                    <Circle className="h-4 w-4 text-primary" />
                                    <span>Mark Complete</span>
                                </>
                            )}
                        </button>
                    )}
                    {typeof exerciseIndex === "number" && (
                        <span className="bg-muted px-2 py-0.5 rounded text-foreground font-mono">
                            Exercise #{exerciseIndex + 1}
                        </span>
                    )}
                </div>

                {onSwap && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={swapping}
                        onClick={handleSwapClick}
                        className="h-8 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${swapping ? "animate-spin" : ""}`} />
                        {swapping ? "Swapping..." : "Swap Exercise"}
                    </Button>
                )}
            </div>

            {/* Image / Visual Header */}
            {hasImages && (
                <div className="relative w-full bg-muted/50 rounded-t-xl overflow-hidden flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-sm aspect-4/3 flex items-center justify-center bg-card rounded-lg overflow-hidden border border-border">
                        {activeImageUrl ? (
                            <img
                                src={activeImageUrl}
                                alt={`${fetchedExercise.name} pose ${selectedImageIndex + 1}`}
                                className="w-full h-full object-contain transition-all duration-300"
                                loading="lazy"
                            />
                        ) : (
                            <div className="text-muted-foreground text-sm flex items-center gap-2">
                                <Dumbbell className="h-6 w-6" /> No image available
                            </div>
                        )}
                        {/* Pose Selector Tabs */}
                        {img0 && img1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-card/95 backdrop-blur-md px-3 py-1 rounded-full border border-border text-xs shadow-md">
                                <button
                                    type="button"
                                    onClick={() => setSelectedImageIndex(0)}
                                    className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                                        selectedImageIndex === 0
                                            ? "bg-primary text-primary-foreground font-bold"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Start Pose
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedImageIndex(1)}
                                    className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                                        selectedImageIndex === 1
                                            ? "bg-primary text-primary-foreground font-bold"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Finish Pose
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CardHeader className="pb-3 pt-4 px-6">
                <div className="flex flex-col gap-2">
                    <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
                        <span className={isCompleted ? "text-foreground" : ""}>
                            {fetchedExercise.name}
                        </span>
                    </CardTitle>
                    {/* Gym Spec Badges */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {fetchedExercise.muscle && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 capitalize">
                                <Target className="h-3.5 w-3.5" />
                                {fetchedExercise.muscle}
                            </span>
                        )}
                        {fetchedExercise.equipment.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border capitalize">
                                <Dumbbell className="h-3.5 w-3.5" />
                                {fetchedExercise.equipment.join(", ")}
                            </span>
                        )}
                        {fetchedExercise.difficulty && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-accent/50 text-accent-foreground border border-accent capitalize">
                                <Flame className="h-3.5 w-3.5" />
                                {fetchedExercise.difficulty}
                            </span>
                        )}
                        {fetchedExercise.type && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border capitalize">
                                <Layers className="h-3.5 w-3.5" />
                                {fetchedExercise.type}
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-2 flex flex-col gap-4">
                {logging}

                {/* Numbered Quick Cues */}
                <div className="flex flex-col gap-2.5">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                        Gym Quick Cues
                    </h4>

                    {instructions.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No instruction steps available.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {displayedSteps.map((step, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40 text-sm leading-relaxed text-foreground"
                                >
                                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                        {idx + 1}
                                    </span>
                                    <p className="flex-1 pt-0.5">{step}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expand / Collapse Button */}
                {hasMoreSteps && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllSteps(!showAllSteps)}
                        className="self-center mt-1 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        {showAllSteps ? (
                            <>
                                Show Less <ChevronUp className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Show All {instructions.length} Steps <ChevronDown className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}


