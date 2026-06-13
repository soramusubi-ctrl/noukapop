import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "農家ポップ | 畑から、すぐデザイン",
  description: "農家さんの売り場・SNS・おたより・ブランド素材をかんたんに作るアプリ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
