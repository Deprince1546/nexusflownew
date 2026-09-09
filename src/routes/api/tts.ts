import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["ELEVENLABS_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "Voice key missing" }, { status: 400 });
        }
        const { text, voiceId } = (await request.json()) as { text?: string; voiceId?: string };
        if (!text?.trim()) return Response.json({ error: "Nothing to say" }, { status: 400 });

        const voice = voiceId || "EXAVITQu4vr4xnSDxMaL";
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({
              text: text.slice(0, 4500),
              model_id: "eleven_turbo_v2_5",
              voice_settings: { stability: 0.45, similarity_boost: 0.75 },
            }),
          },
        );

        if (!response.ok || !response.body) {
          const detail = await response.text().catch(() => "");
          return Response.json({ error: `Voice failed: ${response.status} ${detail.slice(0, 200)}` }, { status: 502 });
        }

        return new Response(response.body, { headers: { "Content-Type": "audio/mpeg" } });
      },
    },
  },
});
