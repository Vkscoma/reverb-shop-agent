"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import stylex from "@stylexjs/stylex";
import { createListingRule } from "@/lib/actions";

const styles = stylex.create({
  form: { display: "grid", gap: 16, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
  field: { display: "grid", gap: 6 },
  label: { color: "var(--muted)", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" },
  input: { appearance: "none", backgroundColor: "var(--input)", borderColor: "var(--border)", borderRadius: 6, borderStyle: "solid", borderWidth: 1, boxShadow: "none", color: "var(--foreground)", outline: "none", padding: "10px 12px", transition: "all 250ms ease", width: "100%", ":focus": { borderColor: "#5d8de8", boxShadow: "none", outline: "none" }, ":focus-visible": { outline: "none" } },
  button: { alignSelf: "end", backgroundColor: "#1456d9", borderColor: "#1456d9", borderRadius: 8, borderStyle: "solid", borderWidth: 1, color: "#fff", cursor: "pointer", fontWeight: 700, padding: "11px 16px", transition: "all 250ms ease", ":hover": { backgroundColor: "#1f63ed", borderColor: "#1f63ed", transform: "translateY(-1px)" }, ":focus-visible": { outline: "2px solid #8db3ff", outlineOffset: 2 } },
  message: { fontSize: 13, gridColumn: "1 / -1", margin: 0 },
  success: { color: "#42c98b" },
  error: { color: "#e26d6d" },
});

export function RuleForm(): React.JSX.Element {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, setPending] = useState<boolean>(false);

  async function submit(formData: FormData): Promise<void> {
    setPending(true);
    const result = await createListingRule({
      listingId: String(formData.get("listingId") ?? ""),
      name: String(formData.get("name") ?? ""),
      floorPrice: Number(formData.get("floorPrice") ?? 0),
      targetPrice: Number(formData.get("targetPrice") ?? 0),
    });
    setMessage(result.ok ? { text: "Rule created.", ok: true } : { text: result.error, ok: false });
    if (result.ok) {
      router.refresh();
      (document.querySelector("form") as HTMLFormElement | null)?.reset();
    }
    setPending(false);
  }

  return (
    <form action={submit} {...stylex.props(styles.form)}>
      <label {...stylex.props(styles.field)}><span {...stylex.props(styles.label)}>Listing ID</span><input name="listingId" required {...stylex.props(styles.input)} /></label>
      <label {...stylex.props(styles.field)}><span {...stylex.props(styles.label)}>Rule name</span><input name="name" required {...stylex.props(styles.input)} /></label>
      <label {...stylex.props(styles.field)}><span {...stylex.props(styles.label)}>Floor price</span><input name="floorPrice" type="number" min="0" required {...stylex.props(styles.input)} /></label>
      <label {...stylex.props(styles.field)}><span {...stylex.props(styles.label)}>Target price</span><input name="targetPrice" type="number" min="0" required {...stylex.props(styles.input)} /></label>
      <button type="submit" disabled={pending} {...stylex.props(styles.button)}>{pending ? "Saving…" : "Add rule"}</button>
      {message ? <p {...stylex.props(styles.message, message.ok ? styles.success : styles.error)}>{message.text}</p> : null}
    </form>
  );
}
