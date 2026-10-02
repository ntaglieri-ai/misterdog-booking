export function StepsIndicator({ labels, current }: { labels: readonly string[]; current: number }) {
  const total = labels.length
  return (
    <div className="flex flex-col gap-2 pb-4 pt-5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-semibold text-c-brown">{labels[current - 1]}</span>
        <span className="text-c-gray">
          Passo {current} di {total}
        </span>
      </div>
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label="Avanzamento prenotazione"
      >
        {labels.map((label, i) => (
          <span
            key={label}
            className={[
              "h-1.5 flex-1 rounded-full transition-colors",
              i < current ? "bg-c-amber" : "bg-c-border",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  )
}
