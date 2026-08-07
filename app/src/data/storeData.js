export const products = [
  {
    id: 'diario-jornada',
    name: 'Diário da Jornada',
    category: 'Organização',
    price: 49.9,
    icon: 'book',
    tone: 'aqua',
    description: 'Caderno para registrar memórias, consultas e descobertas da gestação.',
  },
  {
    id: 'kit-organizador',
    name: 'Kit Organizador',
    category: 'Preparação',
    price: 79.9,
    icon: 'bag',
    tone: 'yellow',
    description: 'Necessaires e etiquetas para organizar itens da maternidade.',
  },
  {
    id: 'cartoes-afeto',
    name: 'Cartões de Afeto',
    category: 'Memórias',
    price: 34.9,
    icon: 'heart',
    tone: 'rose',
    description: 'Cartões para guardar marcos e mensagens especiais da família.',
  },
  {
    id: 'planner-rede',
    name: 'Planner Rede de Apoio',
    category: 'Organização',
    price: 39.9,
    icon: 'users',
    tone: 'mint',
    description: 'Planejamento prático para dividir tarefas e organizar contatos.',
  },
]

export const plans = [
  {
    id: 'essencial',
    name: 'Essencial',
    price: 0,
    description: 'Para começar a organizar sua jornada.',
    features: ['Agenda e diário', 'Check-in de saúde', 'Cartão de emergência'],
  },
  {
    id: 'florescer',
    name: 'Florescer',
    price: 19.9,
    featured: true,
    description: 'Mais acompanhamento para cada etapa.',
    features: ['Tudo do Essencial', 'Histórico completo da Bloomie', 'Relatórios ampliados', 'Conteúdos exclusivos'],
  },
  {
    id: 'familia',
    name: 'Família',
    price: 29.9,
    description: 'Cuidado compartilhado com sua rede de apoio.',
    features: ['Tudo do Florescer', 'Até 3 pessoas de confiança', 'Agenda compartilhada', 'Resumo para acompanhantes'],
  },
]

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
