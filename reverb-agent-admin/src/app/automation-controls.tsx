"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import stylex from "@stylexjs/stylex";
import { triggerReverbSync, updateAutomationSetting } from "@/lib/actions";

const styles = stylex.create({
  controls: { alignItems: "center", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", marginBottom: 20, "@media (max-width: 600px)": { alignItems: "stretch", flexDirection: "column" } },
  checkbox: { accentColor: "#1456d9", height: 18, width: 18 },
  label: { alignItems: "center", color: "var(--foreground)", cursor: "pointer", display: "flex", fontSize: 14, fontWeight: 700, gap: 9 },
  sync: { backgroundColor: "#1456d9", borderColor: "#1456d9", borderRadius: 8, borderStyle: "solid", borderWidth: 1, color: "#fff", cursor: "pointer", fontWeight: 700, padding: "9px 13px", transition: "all 250ms ease", ":hover": { backgroundColor: "#1f63ed", borderColor: "#1f63ed", transform: "translateY(-1px)" }, ":focus-visible": { outline: "2px solid #8db3ff", outlineOffset: 2 }, "@media (max-width: 600px)": { width: "100%" } },
  status: { color: "var(--muted)", fontSize: 13, margin: 0 },
  error: { color: "#e26d6d", fontSize: 13, margin: 0 },
});

export function AutomationControls({ type, enabled }: { type: "offer" | "message"; enabled: boolean }): React.JSX.Element {
  const router = useRouter();
  const [checked, setChecked] = useState<boolean>(enabled);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function changeSetting(nextEnabled: boolean): Promise<void> {
    setChecked(nextEnabled);
    setError("");
    const result = await updateAutomationSetting({ type, enabled: nextEnabled });
    if (!result.ok) { setChecked(!nextEnabled); setError(result.error); }
    else router.refresh();
  }

  async function sync(): Promise<void> {
    setSyncing(true);
    setStatus("");
    setError("");
    const result = await triggerReverbSync();
    if (!result.ok) setError(result.error);
    else { setStatus(`Synced ${result.data.offers} offers and ${result.data.conversations} conversations.`); router.refresh(); }
    setSyncing(false);
  }

  return <div {...stylex.props(styles.controls)}><label {...stylex.props(styles.label)}><input type="checkbox" checked={checked} onChange={(event) => void changeSetting(event.target.checked)} {...stylex.props(styles.checkbox)} />{type === "offer" ? "Enable automatic offer responses" : "Enable automatic message replies"}</label><button type="button" onClick={() => void sync()} disabled={syncing} {...stylex.props(styles.sync)}>{syncing ? "Syncing…" : "Sync now"}</button>{status ? <p {...stylex.props(styles.status)}>{status}</p> : null}{error ? <p {...stylex.props(styles.error)}>{error}</p> : null}</div>;
}
