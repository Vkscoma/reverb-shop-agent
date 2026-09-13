export type OfferDecision = "accept" | "decline" | "counter";

export type OfferRule = {
  floorPrice: number;
  targetPrice: number;
};

export type OfferEvaluation = {
  decision: OfferDecision;
  counterPrice?: number;
};

export function evaluateOffer(offerPrice: number, rule: OfferRule): OfferEvaluation {
  if (!Number.isFinite(offerPrice) || !Number.isFinite(rule.floorPrice) || !Number.isFinite(rule.targetPrice)) throw new Error("Offer and rule prices must be finite numbers.");
  if (rule.floorPrice < 0 || rule.targetPrice < rule.floorPrice) throw new Error("Rule prices are invalid.");
  if (offerPrice >= rule.targetPrice) return { decision: "accept" };
  if (offerPrice < rule.floorPrice) return { decision: "decline" };
  return { decision: "counter", counterPrice: rule.targetPrice };
}