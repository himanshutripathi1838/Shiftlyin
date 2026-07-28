import { useAnimationFrame } from "motion/react";
import { useRef } from "react";
import {
  Logo01,
  Logo02,
  Logo03,
  Logo04,
  Logo05,
  Logo06,
  Logo07,
  Logo08,
} from "@/components/ui/logo-cloud-15-utils/logos";
import { Marquee } from "@/components/ui/logo-cloud-15-utils/marquee";
import { BorderBeam } from "@/components/ui/logo-cloud-15-utils/border-beam";

const BEAM_DURATION = 8;
const BEAM_SIZE = 100;

const LogoCloud = () => {
  const cardRef = useRef(null);
  const textRef = useRef(null);
  const waveSpanRef = useRef(null);
  const startTimeRef = useRef(null);

  useAnimationFrame((time) => {
    if (!(cardRef.current && textRef.current && waveSpanRef.current)) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }

    const elapsed = ((time - startTimeRef.current) / 1000) % BEAM_DURATION;
    const beamOffset = (elapsed / BEAM_DURATION) * 100;

    const cardRect = cardRef.current.getBoundingClientRect();
    const textRect = textRef.current.getBoundingClientRect();

    const W = cardRect.width;
    const H = cardRect.height;
    const perimeter = 2 * (W + H);

    const textLeft = Math.max(0, textRect.left - cardRect.left);
    const textRight = Math.min(W, textRect.right - cardRect.left);

    const textStartPercent = (textLeft / perimeter) * 100;
    const textEndPercent = (textRight / perimeter) * 100;

    const span = waveSpanRef.current;

    if (beamOffset >= textStartPercent && beamOffset <= textEndPercent) {
      const t =
        (beamOffset - textStartPercent) / (textEndPercent - textStartPercent);
      span.style.backgroundPosition = `${95 - t * 90}% center`;
    } else if (beamOffset < textStartPercent) {
      span.style.backgroundPosition = "0% center";
    } else {
      span.style.backgroundPosition = "100% center";
    }
  });

  return (
    <div className="flex w-full items-center justify-center px-4 py-8">
      <div
        className="relative w-full max-w-[1050px] rounded-2xl border border-slate-200 bg-white/70 dark:bg-slate-900/70 dark:border-slate-800 shadow-xl backdrop-blur-md"
        ref={cardRef}
      >
        <BorderBeam
          className="isolate -z-1"
          duration={BEAM_DURATION}
          size={BEAM_SIZE}
        />

        <div className="absolute inset-x-0 top-0 flex -translate-y-1/2 items-center justify-center px-6">
          <p
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-6 py-1.5 text-center font-bold text-slate-800 dark:text-slate-100 text-lg shadow-sm"
            ref={textRef}
          >
            <span
              ref={waveSpanRef}
              style={{
                backgroundImage:
                  "linear-gradient(90deg, currentColor 0%, currentColor 45%, #ffaa40 47%, #9c40ff 50%, #ffaa40 53%, currentColor 55%, currentColor 100%)",
                backgroundSize: "250% 100%",
                backgroundRepeat: "no-repeat",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundPosition: "0% center",
              }}
            >
              Trusted by 500+ Businesses{" "}
              <span className="max-sm:hidden">across India</span>
            </span>
          </p>
        </div>

        <div className="grid overflow-hidden">
          <div className="flex min-w-0 items-center justify-center gap-x-10 p-6 pt-10">
            <Marquee
              className="[--duration:25s] [&_svg]:mx-6"
              pauseOnHover
            >
              <Logo01 />
              <Logo02 />
              <Logo03 />
              <Logo04 />
              <Logo05 />
              <Logo06 />
              <Logo07 />
              <Logo08 />
            </Marquee>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoCloud;
