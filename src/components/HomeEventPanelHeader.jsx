export function HomeEventPanelHeader({
  title,
  headerPill,
  sport,
  organizer,
  detailAction,
}) {
  if (!title && !headerPill) return null;

  return (
    <header className="border-b border-zinc-700/80 pb-4 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {title && (
            <h2 className="text-base sm:text-lg font-bold text-orange-500 leading-snug line-clamp-2">
              {title}
            </h2>
          )}
          {(headerPill || sport) && (
            <p className="mt-1.5 text-xs text-gray-400 tabular-nums leading-relaxed">
              {headerPill}
              {headerPill && sport ? (
                <span className="text-gray-600"> · </span>
              ) : null}
              {sport}
            </p>
          )}
          {organizer && (
            <p className="mt-1 text-xs text-gray-500">Par {organizer}</p>
          )}
        </div>
        {detailAction ? (
          <div className="shrink-0 pt-0.5">{detailAction}</div>
        ) : null}
      </div>
    </header>
  );
}
