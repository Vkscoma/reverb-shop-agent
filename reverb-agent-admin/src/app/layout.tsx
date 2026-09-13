import type { Metadata } from "next";
import stylex from "@stylexjs/stylex";
import "./globals.css";
import { DashboardNav } from "./dashboard-nav";
import { ThemeProvider } from "./theme-provider";

const styles = stylex.create({ html: { minHeight: "100%" }, body: { display: "flex", flexDirection: "column", minHeight: "100vh" } });

export const metadata: Metadata = {
  title: "Reverb Agent Admin",
  description: "Manage Reverb listing rules and human escalations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      {...stylex.props(styles.html)}
    >
      <body {...stylex.props(styles.body)}><ThemeProvider><DashboardNav />{children}</ThemeProvider></body>
    </html>
  );
}
