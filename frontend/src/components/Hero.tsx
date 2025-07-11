import { cn } from "../lib/utils";
import { Spotlight } from "./ui/Spotlight";
import { TypewriterEffectSmoothDemo } from "./Typewriter";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

export function Hero() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden rounded-md bg-black/[0.96] antialiased md:items-center md:justify-center">
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-[#2CFF05]" />
          </div>
          <span className="text-3xl font-bold text-white">Penta</span>
        </Link>
      </div>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]",
        )}
      />

      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      {/* <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0">
        <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
          Penta <br /> The future of analytics is here.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
          Spotlight effect is a great way to draw attention to a specific part
          of the page. Here, we are drawing the attention towards the text
          section of the page. I don&apos;t know why but I&apos;m running out of
          copy.
        </p>
      </div> */}
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0">
        <TypewriterEffectSmoothDemo />
      </div>
    </div>
  );
}
