import { Button } from "@/components/ui/button"

export default function HeroEmptyState() {
  return (
    <section className="relative mx-auto grid max-w-screen-lg place-items-center px-4 py-16 text-center text-white">
      {/* Soft vignette background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.18), rgba(0,0,0,0.7) 60%)",
        }}
      />
      <img
        src="/images/robot.png"
        width={280}
        height={280}
        alt="Robot mascot"
        className="drop-shadow-[0_0_24px_rgba(59,130,246,0.35)]"
      />
      <div className="mt-8 space-y-2">
        <p className="text-pretty text-base text-muted-foreground">
          Hey, it looks like you don’t have any tagged media files.
        </p>
        <p className="text-pretty text-base text-muted-foreground">
          Hit the <span className="font-medium text-foreground">Create tag</span> button to tag new media.
        </p>
      </div>
      <Button className="mt-6 rounded-full bg-brand text-brand-foreground hover:bg-brand/90 px-6" size="sm">
        Create tag
      </Button>
    </section>
  )
}
