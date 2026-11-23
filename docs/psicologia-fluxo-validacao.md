# Psicologia MamaBloom: fluxo para validação

Atualizado em 23/11/2026.
Status: requisitos detalhados; implementação ainda não realizada.
Branch de trabalho: codex/mamabloom-rodadas-validacao.
Referência: pedido do usuário de 23/11/2026. O print antigo indica a localização do acesso; não é uma solicitação de restaurar o layout antigo.

## O que foi solicitado

A Central de Apoio deve manter o design remodelado e oferecer um botão para a página de psicologia.
Nessa página, a usuária escolhe um psicólogo, consulta os dias e horários disponíveis, agenda a consulta, conversa com o profissional e acessa o Google Meet no dia do atendimento.

## Fluxo da usuária

| Etapa | Conteúdo e ação |
| --- | --- |
| Central de Apoio | Botão Agendar consulta com psicólogo no cartão de terapia existente. |
| Escolher profissional | Lista de perfis; ação Ver perfil e horários. |
| Perfil do psicólogo | Foto, nome, idade, formação, experiência e apresentação. Acrescentar registro profissional, especialidades e abordagem como proposta de campos complementares. |
| Agenda do profissional | Selecionar um dia e ver apenas seus horários livres. Exibir duração e fuso do atendimento. |
| Confirmar consulta | Resumo com profissional, data e horário; confirmar sem criar duas reservas para a mesma vaga. |
| Minhas consultas | Ver próximos atendimentos e acompanhar a consulta também na agenda da usuária. |
| Conversa | Ação Conversar com psicólogo abre o chat privado com o profissional escolhido. |
| Dia da consulta | Exibir Entrar no Google Meet na consulta confirmada, se o link real já estiver disponível. |

O fluxo precisa funcionar no celular, com navegação por teclado, estados de carregamento, ausência de resultados e mensagens de erro claras.

## Perfil do profissional

Campos solicitados:
- Nome e foto.
- Idade.
- Formação.
- Experiência.

Campos complementares propostos para facilitar a escolha:
- Registro profissional.
- Especialidades e público atendido.
- Abordagem de trabalho.
- Breve apresentação.
- Duração da sessão e fuso da agenda.

A idade pode ser calculada a partir de uma data de nascimento mantida no servidor; o perfil público exibe somente a idade. Essa estratégia é proposta técnica, não um requisito de exposição da data de nascimento.
Não preencher perfis com credenciais, formação ou experiência inventadas. Exemplos de prévia, se utilizados, devem ser explicitamente identificados como demonstração.

## Disponibilidade e reserva

- A agenda exibida deve pertencer ao psicólogo selecionado.
- Apenas vagas futuras e disponíveis podem ser reservadas.
- Datas e horas devem deixar claro o fuso; proposta inicial: America/Sao_Paulo.
- Validar disponibilidade novamente no servidor no momento da confirmação.
- Se duas pessoas tentarem reservar a mesma vaga, apenas uma confirmação pode ser aceita.
- Consultas confirmadas devem persistir após recarregar e entrar novamente.
- A consulta da agenda da usuária deve apontar para o mesmo registro da reserva, evitando duplicação e divergência.
- Profissional sem horários recebe o estado Sem horários disponíveis, sem simular vagas.
- Cancelamento e eventual reagendamento são extensões propostas; suas regras devem ser definidas antes de disponibilizar essas ações.

## Acesso ao Google Meet

Pedido confirmado: o botão aparece no dia da consulta.
Proposta de comportamento:
- Antes da data: mostrar data e horário do atendimento, sem botão de entrada ativo.
- Na data em America/Sao_Paulo: mostrar Entrar no Google Meet para consulta confirmada com link válido.
- Na data, sem link: informar Link da consulta ainda não disponível, sem simular acesso.
- Consulta cancelada ou encerrada: não oferecer entrada.
- Antes de definir a janela exata de abertura/encerramento em torno do horário, validar a regra de produto; não assumir abertura antecipada.
- A API deve aplicar a mesma regra de acesso usada na tela e restringir o link aos participantes autorizados.
- Confirmar a origem do link: informado pelo profissional/administrador ou criado automaticamente por integração no backend.
- A geração automática exige configuração própria de Calendar/Meet para o produto. A conexão de calendário do desenvolvedor não deve criar reuniões pessoais para usuárias da aplicação.

Não gerar uma URL fictícia nem tratar um link digitado como uma reunião criada automaticamente.

## Chat com o psicólogo

- Conversa real entre a conta da paciente e a conta do psicólogo.
- Enviar e receber mensagens; mostrar autoria e horário.
- Histórico persistente, separado para cada relação paciente/profissional.
- Mensagens e histórico não podem ser lidos por outra paciente nem por outro profissional.
- Exibir falha de envio e permitir tentar novamente sem duplicar mensagens.
- Não simular respostas do psicólogo.
- Não reutilizar as conversas demonstrativas da Central de Apoio como se fossem atendimento profissional.
- Proposta inicial: habilitar a conversa após a primeira reserva confirmada, para vincular o chat ao atendimento.
- A permanência do chat após cancelamento ou conclusão precisa de regra definida.
- A primeira entrega pode atualizar mensagens periodicamente; entrega em tempo real e indicadores de leitura/digitação são evoluções, não requisitos já confirmados.

## Lado do profissional

Para que a paciente possa interagir de verdade, o sistema também precisa de:
- Conta vinculada a um perfil de psicólogo.
- Gestão dos próprios dias e horários livres.
- Lista das próprias consultas.
- Acesso às conversas das próprias pacientes e envio de respostas.
- Inclusão/consulta do link do Meet, de acordo com a origem escolhida.
- Autorização no servidor, sem conceder privilégios apenas porque alguém abriu uma rota do painel.

O modo de cadastro está pendente de resposta do usuário: cadastro pelo psicólogo com aprovação administrativa ou cadastro feito pelo administrador.
A aprovação de psicólogos é uma decisão separada da aprovação de empresas já solicitada para o painel administrativo.

## Entregas pequenas para validação

| Parte | Entrega revisável | Critério de conclusão |
| --- | --- | --- |
| 5A | Entrada e perfis | Botão leva à página; escolher um profissional abre seus dados e sua agenda. |
| 5B | Agenda e reserva | Horários reais, reserva persistida, conflito tratado e consulta presente na agenda. |
| 5C | Chat bilateral | Paciente e psicólogo trocam mensagens em contas distintas, com histórico e isolamento. |
| 5D | Meet no dia | Botão respeita data, estado da consulta, link confirmado e autorização. |

Todas as partes devem manter a identidade visual atual. Uma prévia com dados demonstrativos valida o visual, mas não conclui a agenda ou o chat reais.
Cada parte é validada na branch antes de qualquer integração autorizada na main.

## Verificações de aceitação

- Escolher psicólogos diferentes mostra agendas e perfis diferentes.
- Foto, nome, idade, formação e experiência aparecem corretamente, inclusive em telas estreitas.
- Nenhuma vaga já reservada ou passada pode ser confirmada.
- Duas tentativas simultâneas não geram duas reservas na mesma vaga.
- Mensagem enviada pela paciente aparece para o psicólogo certo; a resposta aparece para a paciente.
- Uma terceira conta não acessa a conversa, a consulta ou o link Meet.
- Antes do dia não há entrada ativa; no dia, a consulta confirmada com link permite entrada.
- Consulta sem link, cancelada ou encerrada não exibe uma entrada utilizável.
- Recarregar ou trocar de dispositivo mantém reservas e histórico.
- Falhas de rede não exibem falsas confirmações.

## Comparação com Render em 23/11/2026

Workspace confirmado: test-devs.
Frontend: mamabloom, deploy dep-dad9ds5g1s2s73fjspb0, status live.
API: mamabloom-api, deploy dep-dahva9jm8hqs73dh8gng, status live.
Ambos publicam o commit e69cdf2bb765364e4f5ad639ee73e1de186049e1 e acompanham a main.
No código dessa revisão, o cartão de terapia apenas informa que o agendamento será conectado em uma etapa futura; não há fluxo de psicologia implementado.
A inspeção desta rodada foi de deploys e código, sem comparação visual autenticada.
Nenhuma alteração funcional, deploy ou mudança na main foi realizada nesta revisão de requisitos.
