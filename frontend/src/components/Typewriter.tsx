"use client";
import { TypewriterEffectSmooth } from "./ui/typewriter.effect";
export function TypewriterEffectSmoothDemo() {
    const words = [
        {
            text: "Manage",
        },
        {
            text: "your",
        },
        {
            text: "finances",
        },
        {
            text: "with",
        },
        {
            text: "Penta.",
            className: "text-[#2CFF05] dark:text-[#2CFF05]",
        },
    ];
    return (
        <div className="flex flex-col items-center justify-center h-[40rem]  ">
            <p className="text-neutral-600 dark:text-neutral-200 text-sm sm:text-2xl  ">
                Financial clarity at your fingertips.
            </p>
            <TypewriterEffectSmooth words={words} />
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
                <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
                    Join now
                </button>
                <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
                    Signup
                </button>
            </div>
        </div>
    );
}
