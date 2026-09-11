import backgroundVideo from "@/assets/nexusflow-bg.mp4.asset.json";

/** Full-page NexusFlow video background with a dark scrim for readability. */
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
        className="size-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
    </div>
  );
}
