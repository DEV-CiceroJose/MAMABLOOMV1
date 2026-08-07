import Icon from '../Icon.jsx'

export default function PrototypeSearch({ label = 'Pesquisar', onChange, placeholder = 'Pesquise aqui...', value = '' }) {
  return (
    <label className="prototype-search">
      <span className="sr-only">{label}</span>
      <input type="search" aria-label={label} placeholder={placeholder} value={value} onChange={onChange} readOnly={!onChange} />
      <span className="prototype-search__icon"><Icon name="search" size={17} /></span>
    </label>
  )
}
