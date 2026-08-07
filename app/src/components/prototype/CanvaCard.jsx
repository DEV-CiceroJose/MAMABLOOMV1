export default function CanvaCard({ children, className = '', tone = 'cream', ...props }) {
  return <article className={`canva-card canva-card--${tone} ${className}`.trim()} {...props}>{children}</article>
}
