// src/hooks/useRun.ts
import { useEffect, useState } from "react";
import { RunsAPI, RunOverview } from "@/api/runs";

export function useRun(runId: string) {
  const [data, setData] = useState<RunOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    const fetchOnce = async () => {
      try { setData(await RunsAPI.get(runId)); setErr(null); }
      catch (e:any) { setErr(e.message); }
      finally { setLoading(false); }
    };
    fetchOnce();
    timer = setInterval(fetchOnce, 2000);
    return () => clearInterval(timer);
  }, [runId]);

  return { data, loading, err };
}
