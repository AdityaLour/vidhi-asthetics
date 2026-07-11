import { Finger_Paint } from "next/font/google";
import "./globals.css";
import "@/styles/admin-layout.css";
import "@/styles/sidebar.css"
import "@/styles/products.css";
import "@/styles/overlay.css";

export const metadata = {
  title: "Vidhi Asthetics",
  description: "Handmade accessories and artwork",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

