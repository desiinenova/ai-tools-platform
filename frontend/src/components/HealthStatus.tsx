"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

type Status = "loading" | "ok" | "error";

export function HealthStatus() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    getHealth()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <p className="text-sm">
      Backend status:{" "}
      <span
        className={
          status === "ok"
            ? "text-green-600"
            : status === "error"
              ? "text-red-600"
              : "text-gray-500"
        }
      >
        {status}
      </span>
    </p>
  );
}
