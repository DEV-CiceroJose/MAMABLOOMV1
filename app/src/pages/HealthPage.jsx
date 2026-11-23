import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PrototypeToolbar from '../components/prototype/PrototypeToolbar.jsx'
import { useLocalData } from '../hooks/useLocalData.js'
import { formatLongDate, toDateKey } from '../lib/date.js'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export default function HealthPage() {
  const [checks, setChecks] = useLocalData('mamabloom:health-checks', [])
  const [form, setForm] = useState({ energy: 3, sleep: 'regular', meals: 'regular', water: 6, foodNotes: '', weight: '', symptoms: '', notes: '', vitamins: false })
  const [saved, setSaved] = useState(false)
  const weightHistory = checks.filter((check) => Number(check.weight) > 0).slice(0, 5)

  function saveCheck(event) {
    event.preventDefault()
    const weight = form.weight === '' ? '' : Number(String(form.weight).replace(',', '.'))
    const check = { ...form, weight, id: createId(), date: toDateKey(), createdAt: new Date().toISOString() }
    setChecks((current) => [check, ...current])
    setSaved(true)
  }

  function weightDelta(index) {
    const next = weightHistory[index + 1]
    if (!next) return null
    const delta = Number(weightHistory[index].weight) - Number(next.weight)
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1).replace('.', ',')} kg`
  }

  return (
    <AppShell className="wellness-prototype health-prototype" header={({ openMenu }) => <header className="wellness-prototype__header"><span><Icon name="activity" /></span><h1>Saúde da mamãe</h1><PrototypeToolbar onMenu={openMenu} /></header>}>

      <aside className="safety-notice">
        <Icon name="alert" />
        <p><strong>Acompanhamento, não diagnóstico.</strong> Estes registros ajudam na conversa com seu pré-natal. Em caso de urgência, procure atendimento profissional.</p>
      </aside>

      <form className="health-check" onSubmit={saveCheck}>
        <div><p className="eyebrow">Check-in semanal</p><h2>Como foi sua semana?</h2></div>
        <fieldset>
          <legend>Nível de energia</legend>
          <div className="energy-scale">
            {[1, 2, 3, 4, 5].map((level) => <button className={Number(form.energy) === level ? 'is-selected' : ''} type="button" key={level} onClick={() => setForm({ ...form, energy: level })}>{level}</button>)}
          </div>
          <small>1 = muito baixa · 5 = ótima</small>
        </fieldset>
        <fieldset>
          <legend>Qualidade do sono</legend>
          <div className="choice-pills">
            {['ruim', 'regular', 'boa'].map((value) => <button className={form.sleep === value ? 'is-selected' : ''} type="button" key={value} onClick={() => setForm({ ...form, sleep: value })}>{value}</button>)}
          </div>
        </fieldset>
        <fieldset>
          <legend>Alimentação</legend>
          <div className="choice-pills">
            {[['irregular', 'Irregular'], ['regular', 'Regular'], ['equilibrada', 'Equilibrada']].map(([value, label]) => <button className={form.meals === value ? 'is-selected' : ''} type="button" key={value} onClick={() => setForm({ ...form, meals: value })}>{label}</button>)}
          </div>
          <div className="water-tracker">
            <span>Hidratação: <strong>{form.water} copos/dia</strong></span>
            <div>
              <button type="button" aria-label="Menos um copo" onClick={() => setForm({ ...form, water: Math.max(0, form.water - 1) })}>−</button>
              <button type="button" aria-label="Mais um copo" onClick={() => setForm({ ...form, water: Math.min(20, form.water + 1) })}>+</button>
            </div>
          </div>
          <small>Recomendação comum: 8 a 10 copos de água por dia, conforme orientação profissional.</small>
        </fieldset>
        <label className="field-label">O que você comeu bem ou sentiu falta?
          <input value={form.foodNotes} onChange={(event) => setForm({ ...form, foodNotes: event.target.value })} placeholder="Ex.: mais frutas, pouca fome à noite" />
        </label>
        <label className="field-label">Registro de peso (kg)
          <input type="number" inputMode="decimal" step="0.1" min="30" max="250" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} placeholder="Ex.: 64,5" />
        </label>
        <label className="field-label">Sintomas ou desconfortos
          <input value={form.symptoms} onChange={(event) => setForm({ ...form, symptoms: event.target.value })} placeholder="Ex.: enjoo leve, dor nas costas" />
        </label>
        <label className="field-label">Observações para a próxima consulta
          <textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Anote dúvidas para conversar com sua equipe" />
        </label>
        <label className="check-row"><input type="checkbox" checked={form.vitamins} onChange={(event) => setForm({ ...form, vitamins: event.target.checked })} /><span><strong>Vitaminas e suplementos em dia</strong><small>Conforme orientação profissional</small></span></label>
        {saved && <p className="form-message" role="status">Check-in salvo no seu dispositivo.</p>}
        <button className="button button--primary button--wide" type="submit">Salvar check-in</button>
      </form>

      {checks[0] && (
        <article className="latest-check">
          <span><Icon name="activity" /></span>
          <div><small>Último check-in · {formatLongDate(checks[0].date)}</small><strong>Energia {checks[0].energy}/5 · Sono {checks[0].sleep}</strong><p>{checks[0].meals ? `Alimentação ${checks[0].meals} · ${checks[0].water ?? 0} copos de água` : ''}{checks[0].weight ? ` · ${String(checks[0].weight).replace('.', ',')} kg` : ''}</p><p>{checks[0].symptoms || 'Nenhum sintoma registrado.'}</p></div>
        </article>
      )}

      {weightHistory.length > 0 && (
        <section className="weight-history" aria-labelledby="weight-history-title">
          <h2 id="weight-history-title">Evolução do peso</h2>
          <ul>
            {weightHistory.map((check, index) => (
              <li key={check.id}><span>{formatLongDate(check.date)}</span><strong>{String(check.weight).replace('.', ',')} kg</strong>{weightDelta(index) && <small>{weightDelta(index)}</small>}</li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  )
}
