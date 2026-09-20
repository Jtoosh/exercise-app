import { NavLink } from "react-router";
import { ArrowRight, Dumbbell, ListChecks, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Homepage() {
    return <div className="max-w-3xl mx-auto py-12 sm:py-20 space-y-10">
        <div className="space-y-6">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">A little structure. A stronger you.</span>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-tight">Your workout.<br />One circuit at a time.</h1>
            <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">Build a workout around your time and equipment. Follow each exercise, log your sets, and keep moving.</p>
            <Button asChild className="h-12 px-6"><NavLink to="/buildWorkout">Build a workout <ArrowRight className="size-4" /></NavLink></Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 border-t pt-8">
            {[
                { icon: SlidersHorizontal, title: "Make it yours", description: "Choose your focus, time, and equipment." },
                { icon: ListChecks, title: "See the plan", description: "A simple list keeps your workout in view." },
                { icon: Dumbbell, title: "Focus on the set", description: "Instructions and logging, one exercise at a time." },
            ].map(({ icon: Icon, title, description }) => <div key={title} className="space-y-2">
                <Icon className="size-5 text-primary" />
                <h2 className="font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>)}
        </div>
    </div>;
}
