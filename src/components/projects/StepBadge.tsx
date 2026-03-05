const STEP_LABELS: Record<string, { label: string; color: string }> = {
  summary: { label: 'Summary', color: 'bg-blue-100 text-blue-800' },
  design: { label: 'Design', color: 'bg-purple-100 text-purple-800' },
  edit: { label: 'Edit', color: 'bg-amber-100 text-amber-800' },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-800' },
};

export function StepBadge({ step }: { step?: string }) {
  if (!step) return <span class="text-gray-400 text-xs">—</span>;
  const cfg = STEP_LABELS[step] ?? { label: step, color: 'bg-gray-100 text-gray-700' };
  return (
    <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
