// src/pages/RunPage.tsx
import { useParams } from "react-router-dom";
import { useRunStream } from "@/hooks/useRunStream"; // 或 useRun

export default function RunPage() {
  const { runId } = useParams<{ runId: string }>();
  const { data, status } = useRunStream(runId!);

  if (!data) return <div className="p-8">連線中…（{status}）</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">查證結果</h1>
        <div className="rounded-xl bg-slate-100 px-4 py-2">
          <span className="mr-3 font-semibold">{data.overview?.verdict ?? "進行中"}</span>
          <span className="text-slate-600">分數：{(data.overview?.score_true ?? 0).toFixed(2)}</span>
        </div>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <div className="text-sm text-slate-700">{data.summary?.judge?.rationale || "分析中…"}</div>
      </section>

      {/* 其餘：雷達圖、正反摘要、辯論、證據…用你已完成的元件渲染 data */}
    </div>
  );
}
