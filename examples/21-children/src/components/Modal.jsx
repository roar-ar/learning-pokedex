import { useId } from 'react'

export default function Modal({ dialogRef, title, onCancel, children }) {
  const titleId = useId()

  return (
    <dialog className="filters-dialog" ref={dialogRef} aria-labelledby={titleId} onCancel={onCancel}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  )
}
