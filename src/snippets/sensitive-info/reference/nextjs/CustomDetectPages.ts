import arcjet, { sensitiveInfo } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";

// This function is called by the `sensitiveInfo` rule to perform custom detection on strings.
function detectDash(tokens: string[]): Array<"CONTAINS_DASH" | undefined> {
  return tokens.map((token) => {
    if (token.includes("-")) {
      return "CONTAINS_DASH";
    }
  });
}

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      deny: ["EMAIL", "CONTAINS_DASH"],
      mode: "LIVE",
      detect: detectDash,
      contextWindowSize: 2,
    }),
  ],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const decision = await aj.protect(req);
  console.log("Decision", decision);

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isSensitiveInfo()) {
      console.log("Sensitive info rule", result);
    }
  }

  if (decision.isDenied()) {
    return res
      .status(403)
      .json({ error: "Forbidden", reason: decision.reason });
  }

  res.status(200).json({ name: "Hello world" });
}