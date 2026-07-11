export const SITE = {
  name: 'Vilmar Guimarães Júnior',
  title: 'Vilmar Guimarães Júnior – Advogado',
  description:
    'Assessoria jurídica especializada em Direito do Consumidor, Direito Digital e Direito da Saúde. Atendimento personalizado, transparente e comprometido com seus direitos.',
  oab: 'OAB/MG',
  email: 'vilmarjunior.advogado@gmail.com',
  whatsapp: '31999999999',
  whatsappDisplay: '(31) 99999-9999',
  address: 'Belo Horizonte – MG',
  instagram: 'https://instagram.com/vilmarguimaraes.adv',
  linkedin: 'https://linkedin.com/in/vilmarguimaraes',
  baseUrl: 'https://vilmarguimaraes.adv.br',
}

export const NAV_LINKS = [
  { label: 'Início',              href: '/' },
  { label: 'Sobre',               href: '#sobre' },
  { label: 'Áreas de Atuação',   href: '#areas-de-atuacao' },
  { label: 'Diferenciais',        href: '#diferenciais' },
  { label: 'Como Funciona',       href: '#como-funciona' },
  { label: 'Blog',                href: '#blog' },
  { label: 'FAQ',                 href: '#faq' },
  { label: 'Contato',             href: '#contato' },
]

export const PRACTICE_AREAS = [
  {
    id: 'consumidor',
    icon: 'Shield',
    title: 'Direito do Consumidor',
    tagline: 'Defesa efetiva nas relações de consumo',
    description:
      'Atuação na proteção dos direitos do consumidor frente a práticas abusivas, cobranças indevidas, vícios em produtos e serviços, contratos leoninos e negativação irregular.',
    topics: [
      'Cobranças indevidas e juros abusivos',
      'Vícios em produtos e serviços',
      'Práticas comerciais abusivas',
      'Negativação indevida no SPC/Serasa',
      'Contratos de adesão abusivos',
      'Responsabilidade civil do fornecedor',
      'Cancelamento e estorno de compras',
      'Publicidade enganosa e abusiva',
    ],
    color: 'from-blue-900 to-blue-950',
    accent: 'blue',
  },
  {
    id: 'digital',
    icon: 'Globe',
    title: 'Direito Digital',
    tagline: 'Proteção jurídica no ambiente virtual',
    description:
      'Assessoria jurídica para questões do ambiente digital, incluindo proteção de dados pessoais (LGPD), crimes cibernéticos, direito à desindexação, remoção de conteúdo e contratos digitais.',
    topics: [
      'Proteção de dados pessoais (LGPD)',
      'Crimes cibernéticos e hackers',
      'Direito ao esquecimento e desindexação',
      'Remoção de conteúdo ofensivo',
      'Responsabilidade de plataformas digitais',
      'Contratos e comércio eletrônico',
      'Difamação e fake news online',
      'Propriedade intelectual digital',
    ],
    color: 'from-emerald-900 to-emerald-950',
    accent: 'emerald',
  },
  {
    id: 'saude',
    icon: 'Heart',
    title: 'Direito da Saúde',
    tagline: 'O direito à saúde como prioridade',
    description:
      'Atuação em demandas de saúde, especialmente em casos de negativa de cobertura por planos de saúde, tratamentos recusados, medicamentos não fornecidos e responsabilidade médico-hospitalar.',
    topics: [
      'Negativa de cobertura por plano de saúde',
      'Tratamentos e procedimentos negados',
      'Medicamentos de alto custo',
      'Internação e UTI negadas',
      'Erro médico e responsabilidade civil',
      'Responsabilidade hospitalar',
      'Direito à saúde infantil',
      'Acesso a tratamentos via SUS',
    ],
    color: 'from-rose-900 to-rose-950',
    accent: 'rose',
  },
]

export const DIFFERENTIALS = [
  {
    icon: 'UserCheck',
    title: 'Atendimento Humanizado',
    description:
      'Cada cliente recebe atenção individualizada. Tratamos seu caso com escuta ativa e empatia, sem burocracia desnecessária.',
  },
  {
    icon: 'Eye',
    title: 'Transparência Total',
    description:
      'Comunicação clara e direta em todas as etapas. Sem jargões jurídicos difíceis — você sempre sabe o que está acontecendo.',
  },
  {
    icon: 'BookOpen',
    title: 'Especialização Técnica',
    description:
      'Atuação focada em áreas específicas do direito, com estudo contínuo e profundo domínio técnico-jurídico.',
  },
  {
    icon: 'MessageSquare',
    title: 'Comunicação Ágil',
    description:
      'Canal de atendimento eficiente para dúvidas e atualizações. Respondemos prontamente e mantemos você sempre informado.',
  },
  {
    icon: 'Scale',
    title: 'Ética Inabalável',
    description:
      'Exercício da advocacia pautado pelos mais rígidos padrões éticos da OAB, com integridade em cada decisão tomada.',
  },
  {
    icon: 'Laptop',
    title: 'Advocacia Digital',
    description:
      'Atendimento presencial e remoto. Uso de tecnologia para agilizar processos, documentos e comunicação com o cliente.',
  },
]

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Consulta Inicial',
    description:
      'Entre em contato por WhatsApp, e-mail ou pelo formulário do site. Agende uma conversa inicial para apresentar sua situação.',
  },
  {
    step: '02',
    title: 'Análise do Caso',
    description:
      'Avaliação detalhada da situação jurídica, análise da documentação e identificação das melhores estratégias possíveis.',
  },
  {
    step: '03',
    title: 'Proposta Transparente',
    description:
      'Apresentação de proposta clara sobre os honorários e condições, de forma transparente e sem surpresas.',
  },
  {
    step: '04',
    title: 'Acompanhamento Contínuo',
    description:
      'Assessoria jurídica dedicada com atualizações regulares sobre o andamento do caso e disponibilidade para dúvidas.',
  },
]

export const FAQ_ITEMS = [
  {
    question: 'Como posso agendar uma consulta?',
    answer:
      'Você pode entrar em contato pelo WhatsApp, e-mail ou pelo formulário de contato deste site. Respondemos em até 24 horas úteis para agendar a consulta.',
  },
  {
    question: 'O atendimento é presencial ou online?',
    answer:
      'Oferecemos atendimento presencial em Belo Horizonte/MG e atendimento remoto por videoconferência para clientes de qualquer localidade do país.',
  },
  {
    question: 'Como funciona o pagamento dos honorários?',
    answer:
      'Os honorários advocatícios são discutidos e acordados de forma transparente antes do início de qualquer serviço. Valores e condições variam conforme a complexidade e a natureza de cada caso.',
  },
  {
    question: 'O que é Direito Digital e como ele pode me ajudar?',
    answer:
      'O Direito Digital é o ramo jurídico que regula as relações no ambiente virtual. Pode ajudá-lo em casos de vazamento de dados, crimes cibernéticos, conteúdo difamatório na internet, proteção de privacidade e muito mais.',
  },
  {
    question: 'O plano de saúde pode negar meu tratamento?',
    answer:
      'Em muitas situações, a negativa de cobertura por plano de saúde é ilegal. A análise jurídica do seu contrato e das normas da ANS é fundamental para verificar se houve violação ao seu direito à saúde e quais medidas cabem.',
  },
  {
    question: 'Tive meu nome negativado indevidamente. O que fazer?',
    answer:
      'A negativação indevida pode ser questionada judicialmente, sendo possível requerer a exclusão imediata do nome dos cadastros de inadimplentes e a reparação pelos danos sofridos. Entre em contato para análise do seu caso.',
  },
  {
    question: 'Meus dados pessoais foram vazados. Tenho direito à indenização?',
    answer:
      'A Lei Geral de Proteção de Dados (LGPD) garante direitos importantes às vítimas de vazamentos. Dependendo do caso, é possível buscar reparação pelos danos causados pelo tratamento inadequado dos seus dados pessoais.',
  },
  {
    question: 'Preciso comparecer pessoalmente ao escritório?',
    answer:
      'Não necessariamente. Muitas etapas do atendimento jurídico podem ser realizadas de forma remota, com envio digital de documentos e reuniões por videoconferência.',
  },
]

export const BLOG_POSTS = [
  {
    id: '1',
    slug: 'lgpd-direitos-titular-dados',
    category: 'Direito Digital',
    title: 'LGPD: Conheça seus direitos como titular de dados pessoais',
    excerpt:
      'A Lei Geral de Proteção de Dados garante uma série de direitos aos cidadãos brasileiros sobre como suas informações são coletadas e tratadas. Saiba quais são.',
    date: '2026-07-01',
    readTime: '5 min',
  },
  {
    id: '2',
    slug: 'plano-saude-negativa-cobertura',
    category: 'Direito da Saúde',
    title: 'Plano de saúde negou seu tratamento? Entenda seus direitos',
    excerpt:
      'A negativa de cobertura é uma das situações mais frustrantes para os beneficiários. Entenda quando a negativa é ilegal e como agir juridicamente.',
    date: '2026-06-20',
    readTime: '6 min',
  },
  {
    id: '3',
    slug: 'negativacao-indevida-spc-serasa',
    category: 'Direito do Consumidor',
    title: 'Negativação indevida: como contestar e buscar reparação',
    excerpt:
      'Ter o nome negativado sem dever nada é uma experiência humilhante e prejudicial. Saiba como identificar uma negativação indevida e o que a lei prevê.',
    date: '2026-06-10',
    readTime: '7 min',
  },
]
