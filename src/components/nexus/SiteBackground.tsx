import backgroundVideo from "@/assets/nexusflow-bg.mp4.asset.json";

/** Full-page NexusFlow video background, shown at full clarity (no fade or overlay). */
export function SiteBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <video
        src={backgroundVideo.url}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="size-full object-cover"
      />
    </div>
  );
}
