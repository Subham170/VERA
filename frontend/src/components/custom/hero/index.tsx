import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HeroEmptyState() {
  const router = useRouter();

  const handleCreateTag = () => {
    router.push("/create-tag");
  };

  return (
    <section className="relative mx-auto grid max-w-screen-lg place-items-center px-4 py-16 text-center text-white min-h-[80vh]">
      {/* Enhanced gradient background matching the image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse at bottom left, rgba(59, 130, 246, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)
          `,
        }}
      />
      <div className="relative">
        <img
          src="/images/robot.png"
          width={280}
          height={280}
          alt="Robot mascot"
          className="drop-shadow-[0_0_32px_rgba(59,130,246,0.4)] filter brightness-110 contrast-110"
        />
        {/* Additional glow effect for the robot */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
            transform: "scale(1.2)",
          }}
        />
      </div>
      <div className="mt-8 space-y-2">
        <p className="text-pretty text-base text-white/80">
          Hey, it looks like you don't have any tagged media files.
        </p>
        <p className="text-pretty text-base text-white/80">
          Hit the <span className="font-medium text-blue-400">Create tag</span>{" "}
          button to tag new media.
        </p>
      </div>
      <Button
        onClick={handleCreateTag}
        className="mt-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        size="lg"
      >
        Create tag
      </Button>
    </section>
  );
}
