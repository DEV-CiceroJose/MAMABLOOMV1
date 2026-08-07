import Icon from './Icon.jsx'

export default function FormField({
  error,
  icon,
  id,
  label,
  rightAction,
  ...inputProps
}) {
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrap${error ? ' input-wrap--error' : ''}`}>
        {icon && <Icon name={icon} size={20} />}
        <input id={id} aria-invalid={Boolean(error)} aria-describedby={errorId} {...inputProps} />
        {rightAction}
      </div>
      {error && <p className="field-error" id={errorId}>{error}</p>}
    </div>
  )
}
