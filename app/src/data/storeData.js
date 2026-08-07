export const products = [
  {
    id: 'perfume',
    name: 'Perfume',
    brand: 'Natura',
    category: 'Cuidados',
    price: 30,
    image: 'store-perfume.webp',
    tone: 'aqua',
    description: 'Fragrância suave para tornar a rotina mais acolhedora.',
  },
  {
    id: 'chupeta',
    name: 'Chupeta',
    brand: 'Elodie',
    category: 'Bebê',
    price: 12,
    image: 'store-pacifier.webp',
    tone: 'yellow',
    description: 'Modelo delicado e confortável para o bebê.',
  },
  {
    id: 'berco',
    name: 'Berço',
    brand: 'Multimóveis',
    category: 'Quarto',
    price: 900,
    image: 'store-crib.webp',
    tone: 'rose',
    description: 'Berço compacto para um cantinho seguro e tranquilo.',
  },
  {
    id: 'lenco-umedecido',
    name: 'Lenço umedecido',
    brand: "Johnson's",
    category: 'Higiene',
    price: 25,
    image: 'store-wipes.webp',
    tone: 'mint',
    description: 'Limpeza delicada para a pele sensível do bebê.',
  },
  {
    id: 'fraldas',
    name: 'Fraldas',
    brand: 'Pampers',
    category: 'Higiene',
    price: 45,
    image: 'store-diapers.webp',
    tone: 'aqua',
    description: 'Proteção confortável para todos os momentos.',
  },
  {
    id: 'leite-em-po',
    name: 'Leite em pó',
    brand: 'Nestlé',
    category: 'Alimentação',
    price: 40,
    image: 'store-formula.webp',
    tone: 'yellow',
    description: 'Item demonstrativo; use somente com orientação profissional.',
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
