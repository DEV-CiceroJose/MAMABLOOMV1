const urgentTerms = ['sangramento', 'desmaio', 'falta de ar', 'dor forte', 'convulsão', 'emergência']
const emotionalTerms = ['ansiosa', 'ansiedade', 'triste', 'medo', 'chorando', 'sobrecarregada']
const sleepTerms = ['sono', 'dormir', 'insônia', 'cansada', 'cansaço']

function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function createBloomieReply(input) {
  const text = normalize(input)

  if (urgentTerms.some((term) => text.includes(normalize(term)))) {
    return {
      tone: 'urgent',
      text: 'Sinto muito que você esteja passando por isso. Não consigo avaliar urgências. Procure agora um serviço de emergência ou entre em contato com sua equipe de saúde. Se puder, peça para alguém de confiança acompanhar você.',
    }
  }

  if (emotionalTerms.some((term) => text.includes(normalize(term)))) {
    return {
      tone: 'support',
      text: 'Obrigada por dividir isso comigo. Tente respirar devagar, apoiar os pés no chão e nomear três coisas que você consegue ver. Se esse sentimento persistir ou ficar intenso, converse com alguém de confiança e com sua equipe de pré-natal.',
    }
  }

  if (sleepTerms.some((term) => text.includes(normalize(term)))) {
    return {
      tone: 'general',
      text: 'O descanso pode mudar bastante durante a gestação. Uma rotina mais calma à noite e registrar o que atrapalhou seu sono podem ajudar na conversa com o pré-natal. Evite iniciar medicamentos ou suplementos sem orientação profissional.',
    }
  }

  return {
    tone: 'general',
    text: 'Estou aqui para acolher e ajudar você a organizar seus pensamentos. Posso sugerir uma pausa de respiração, registrar esse momento no diário ou preparar uma pergunta para sua próxima consulta.',
  }
}
