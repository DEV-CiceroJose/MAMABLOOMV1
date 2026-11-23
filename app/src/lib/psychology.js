export const saoPauloDay = (value) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date(value))
export const statusLabel = (value) => ({ pending: 'Pendente de aprovação', approved: 'Aprovado', rejected: 'Rejeitado', confirmed: 'Confirmada' })[value] || value
