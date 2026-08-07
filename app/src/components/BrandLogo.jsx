export default function BrandLogo({ compact = false }) {
  return (
    <img
      className={`brand-logo${compact ? ' brand-logo--compact' : ''}`}
      src={`${import.meta.env.BASE_URL}brand/logo.webp`}
      alt="MamaBloom"
      width={compact ? 144 : 220}
      height={compact ? 96 : 147}
    />
  )
}
