const ORB_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260816_125506_3a597378-ec85-4ebd-bd22-03b45508ac62.mp4";

export function Orb({ active, caption }: { active: boolean; caption?: string | undefined }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-40 flex flex-col items-center gap-4 px-6 md:bottom-32">
      <div className="orb-pulse relative size-40 md:size-56">
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl" />
        <video
          src={ORB_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="relative size-full rounded-full object-cover shadow-[0_0_80px_rgba(200,40,40,0.45)]"
        />
      </div>
      {caption ? (
        <p className="max-w-xl text-center text-sm leading-6 text-muted-foreground">{caption}</p>
      ) : null}
    </div>
  );
}
