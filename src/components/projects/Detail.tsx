export function Detail({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p class={`text-sm text-gray-700 truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value ?? <span class="text-gray-300">—</span>}
      </p>
    </div>
  );
}
