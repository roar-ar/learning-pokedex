export const STAT_SCALE = 200

export default function StatBar({ label, value }) {
  const width = Math.min(100, Math.max(0, value / STAT_SCALE * 100))

  return (
    <div className="stat-row">
      <dt>{label}</dt>
      <dd>
        <span>{value}</span>
        <span className="stat-track" aria-hidden="true">
          <span className="stat-fill" style={{ width: width + '%' }} />
        </span>
      </dd>
    </div>
  )
}
