export default function InfoPanel({ title, children }) {
  return (
    <section className="info-panel">
      <h3>{title}</h3>
      {children}
    </section>
  )
}
