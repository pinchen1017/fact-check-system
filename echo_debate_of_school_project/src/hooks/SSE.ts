// src/hooks/useRunStream.ts
import { useEffect, useState } from "react";
import type { RunOverview } from "@/api/runs";

export function useRunStream(runId: string) {
  const [data, setData] = useState<RunOverview | null>(null);
  const [status, setStatus] = useState<"running"|"done"|"failed">("running");

  useEffect(() => {
    const es = new EventSource(`/api/runs/${runId}/stream`);
    es.onmessage = e => {
      const payload: RunOverview = JSON.parse(e.data);
      setData(payload);
      setStatus(payload.status);
      if (payload.status !== "running") es.close();
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [runId]);

  return { data, status };
}
