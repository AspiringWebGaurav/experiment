"use client";

import { Toaster } from "sonner";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={3000}
      toastOptions={{
        style: {
          background: "white",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
        },
      }}
    />
  );
}
