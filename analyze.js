export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { promptData } = req.body;

  if (!promptData) {
    return res.status(400).json({ error: "Missing promptData" });
  }

  const systemPrompt = `You are a sharp, no-fluff digital marketing consultant helping a small web development agency owner running Google Ads on a tight budget (around €8/day). Given their campaign and website metrics, diagnose where the real problem likely is: the ads (targeting, keywords, quality score, impression share) or the website/funnel (bounce rate, session duration, conversion friction). Be direct and specific, not generic. Structure your answer as:
1. One-sentence verdict starting with exactly "This is mainly an Ads problem" or "This is mainly a Website problem" or "This is both an Ads and Website problem" - then explain briefly.
2. Top 2-3 specific things to fix, based on the actual numbers given, in priority order.
3. One thing NOT to worry about right now.
Keep it under 200 words. No preamble, get straight into it.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: promptData }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }

    const text = data.content.map((b) => b.text || "").join("\n");
    return res.status(200).json({ diagnosis: text });
  } catch (err) {
    return res.status(500).json({ error: "Server error, please try again" });
  }
}
