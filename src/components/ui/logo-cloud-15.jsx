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
  return (
    <div className="flex w-full items-center justify-center px-4 py-6">
      <div className="relative w-full max-w-[1050px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl backdrop-blur-md transition-colors duration-300">
        <BorderBeam
          className="isolate -z-1"
          duration={BEAM_DURATION}
          size={BEAM_SIZE}
        />

        <div className="grid overflow-hidden">
          <div className="flex min-w-0 items-center justify-center gap-x-10 p-6">
            <Marquee
              className="[--duration:25s]"
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
