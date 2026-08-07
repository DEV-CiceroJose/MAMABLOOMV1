import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import PageTitle from '../components/PageTitle.jsx'
import { useLocalData } from '../hooks/useLocalData.js'
import { formatLongDate, toDateKey } from '../lib/date.js'

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export default function HealthPage() {
  const [checks, setChecks] = useLocalData('mamabloom:health-checks', [])
  const [form, setForm] = useState({ energy: 3, sleep: 'regular', symptoms: '', notes: '', vitamins: false })
  const [saved, setSaved] = useState(false)

  function saveCheck(event) {
    event.preventDefault()
    const check = { ...form, id: createId(), date: toDateKey(), createdAt: new Date().toISOString() }
    setChecks((current) => [check, ...current])
    setSaved(true)
  }

  return (
    <AppShell>
      <PageTitle eyebrow="Bem-estar" title="Saúde da mamãe" />

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
          <div><small>Último check-in · {formatLongDate(checks[0].date)}</small><strong>Energia {checks[0].energy}/5 · Sono {checks[0].sleep}</strong><p>{checks[0].symptoms || 'Nenhum sintoma registrado.'}</p></div>
        </article>
      )}
    </AppShell>
  )
}
