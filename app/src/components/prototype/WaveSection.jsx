export default function WaveSection({ children, className = '', tone = 'yellow', ...props }) {
  return <section className={`wave-section wave-section--${tone} ${className}`.trim()} {...props}><span className="wave-section__curve" aria-hidden="true" />{children}</section>
}
