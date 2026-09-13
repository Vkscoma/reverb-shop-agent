"use client";

import { useState } from "react";
import stylex from "@stylexjs/stylex";
import { createListingRule } from "@/lib/actions";

const styles = stylex.create({
  form: { display: "grid", gap: 16, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
  field: { display: "grid", gap: 6 },
  label: { color: "#526078", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" },
  input: { border: "1px solid #d9dfeb", borderRadius: 8, color: "#172033", padding: "10px 12px", width: "100%" },
  button: { alignSelf: "end", backgroundColor: "#1456d9", border: 0, borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 700, padding: "11px 16px" },
  message: { color: "#b42318", fontSize: 13, gridColumn: "1 / -1", margin: 0 },
});

export function RuleForm(): React.JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);

  async function submit(formData: FormData): Promise<void> {
    setPending(true);
    const result = await createListingRule({
      listingId: String(formData.get("listingId") ?? ""),
      name: String(formData.get("name") ?? ""),
      floorPrice: Number(formData.get("floorPrice") ?? 0),
      targetPrice: Number(formData.get("targetPrice") ?? 0),
    });
    setMessage(result.ok ? "Rule saved. Refresh to see the latest rules." : result.error);
    setPending(false);
  }

  return (
    <form action={submit} {...stylex.props(styles.form)}>
      <label {...stylex.props(styles.field)}><span {...stylex.props(styles.label)}>Listing ID</span><input name="listingId" required {...stylex.props(styles.input)} /></label>
      <label {...stylex.props(styles.field)}><span {...stylex.props(styles.label)}>Rule name</span><input name="name" required {...stylex.props(styles.input)} /></label>
      <label {...stylex.props(styles.field)}><span {...stylex.props(styles.label)}>Floor price</span><input name="floorPrice" type="number" min="0" required {...stylex.props(styles.input)} /></label>
      <label {...stylex.props(styles.field)}><span {...stylex.props(styles.label)}>Target price</span><input name="targetPrice" type="number" min="0" required {...stylex.props(styles.input)} /></label>
      <button type="submit" disabled={pending} {...stylex.props(styles.button)}>{pending ? "Saving…" : "Add rule"}</button>
      {message ? <p {...stylex.props(styles.message)}>{message}</p> : null}
    </form>
  );
}
