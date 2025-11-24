const questions = [
  {
    videoId: "f1n1whYbo5Y",
    startTime: 1,
    endTime: 4,
    audioText: "What is this? I think I got an idea",
    level: "beginner",
    options: [
      "O que é isso? Acho que tive uma ideia",
      "O que é aquilo? Acho que entendi"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'This' = isso (perto). 'That' seria aquilo. 'Got an idea' = tive uma ideia nova, não apenas entendi."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 14,
    endTime: 20,
    audioText: "Okay, so we messed up, but the world didn't end. We rebuilt it better for some",
    level: "intermediate",
    options: [
      "Ok, então bagunçamos, mas o mundo não acabou. Reconstruímos melhor para alguns",
      "Ok, então bagunçamos, mas o mundo não acabou. Reconstruímos melhor para todos"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'For some' = para alguns (não todos). Indica que apenas parte se beneficiou."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 21,
    endTime: 27,
    audioText: "The genetics. Genetically improved humans that live like kings",
    level: "intermediate",
    options: [
      "Os geneticamente modificados. Humanos melhorados que vivem como reis",
      "Os geneticamente modificados. Humanos melhorados que trabalham como reis"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Live like kings' = viver como reis (estilo de vida luxuoso). 'Trabalhar' mudaria completamente o sentido."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 26,
    endTime: 33,
    audioText: "Then there's the specials. Although there's nothing special about us",
    level: "intermediate",
    options: [
      "Então há os especiais. Embora não haja nada de especial sobre nós",
      "Então há os especiais. Embora haja algo de especial sobre nós"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Nothing special' = nada de especial (irônico). A negação é essencial para o significado."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 32,
    endTime: 38,
    audioText: "Proposition 42 enables genetic enhancement for everyone",
    level: "advanced",
    options: [
      "Proposta 42 permite aprimoramento genético para todos",
      "Proposta 42 proíbe aprimoramento genético para todos"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Enables' = permite/habilita. Oposto de 'prohibits/bans' (proíbe)."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 38,
    endTime: 45,
    audioText: "Fix my suit. I'll pay you triple. Deal. Triple free. Well, don't go to the genetic district",
    level: "advanced",
    options: [
      "Conserte meu traje. Pagarei o triplo. Feito. Triplo grátis. Bem, não vá ao distrito genético",
      "Conserte meu traje. Pagarei o triplo. Feito. Triplo grátis. Bem, vá ao distrito genético"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Don't go' = não vá (ordem negativa/aviso). Sem o 'don't' seria o oposto."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 60,
    endTime: 65,
    audioText: "Today's attack by the extremist anti-genetic squad is the bloodiest so far",
    level: "advanced",
    options: [
      "O ataque de hoje pelo esquadrão extremista anti-genético é o mais sangrento até agora",
      "O ataque de hoje pelo esquadrão extremista pró-genético é o mais sangrento até agora"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Anti-genetic' = contra genéticos. 'Pró-genetic' seria a favor, mudando totalmente quem atacou."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 65,
    endTime: 68,
    audioText: "They're going to frame the specialists. Well, we got to do something then",
    level: "intermediate",
    options: [
      "Eles vão incriminar os especialistas. Bem, temos que fazer algo então",
      "Eles vão proteger os especialistas. Bem, temos que fazer algo então"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Frame' = incriminar falsamente (negativo). 'Protect' seria positivo, oposto total."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 78,
    endTime: 83,
    audioText: "He's the one behind all of this. We've cracked the enigma of human evolution",
    level: "advanced",
    options: [
      "Ele é o responsável por tudo isso. Desvendamos o enigma da evolução humana",
      "Ele é a vítima de tudo isso. Desvendamos o enigma da evolução humana"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Behind' = responsável/autor (causou). 'Vítima' mudaria completamente o papel dele."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 87,
    endTime: 94,
    audioText: "Question is, what are we going to do about it? We're going to fight",
    level: "intermediate",
    options: [
      "A questão é, o que vamos fazer sobre isso? Vamos lutar",
      "A questão é, o que vamos fazer sobre isso? Vamos fugir"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Fight' = lutar (enfrentar). 'Flee/run' seria fugir, ação oposta."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 96,
    endTime: 102,
    audioText: "They want you to think that you're useless, worthless. It's not true",
    level: "intermediate",
    options: [
      "Eles querem que você pense que é inútil, sem valor. Não é verdade",
      "Eles querem que você pense que é inútil, sem valor. É verdade"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'It's not true' = não é verdade (contradiz). Sem o 'not' concordaria com a afirmação."
  },
  {
    videoId: "f1n1whYbo5Y",
    startTime: 104,
    endTime: 110,
    audioText: "It's evolution and you can't stop it",
    level: "beginner",
    options: [
      "É evolução e você não pode parar isso",
      "É evolução e você pode parar isso"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Can't stop' = não pode parar (impossível). Sem 'can't' seria possível parar."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 1,
    endTime: 4,
    audioText: "Cubs are wild in pursuit of suspect",
    level: "intermediate",
    options: [
      "Policiais estão em perseguição selvagem do suspeito",
      "Policiais estão fugindo do suspeito"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'In pursuit of' = perseguindo (caçando). Oposto de 'fleeing from' (fugindo de)."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 3,
    endTime: 7,
    audioText: "Back off the keys. We got him. Rolling spike",
    level: "intermediate",
    options: [
      "Afaste-se das chaves. Pegamos ele. Espinho rolante",
      "Pegue as chaves. Perdemos ele. Espinho rolante"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Back off' = afastar-se. 'Got him' = pegamos (sucesso). Opostos mudam tudo."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 10,
    endTime: 14,
    audioText: "Sorry. Could you show me that clip again? Wasn't wearing my glasses",
    level: "advanced",
    options: [
      "Desculpe. Você poderia me mostrar esse clipe de novo? Não estava usando meus óculos",
      "Desculpe. Você poderia me mostrar esse clipe de novo? Estava usando meus óculos"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Wasn't wearing' = não estava usando (explica por que não viu bem). Sem 'wasn't' não faria sentido pedir pra ver de novo."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 18,
    endTime: 25,
    audioText: "Fail at this case and I will split you up",
    level: "intermediate",
    options: [
      "Falhe neste caso e eu vou separar vocês",
      "Tenham sucesso neste caso e eu vou separar vocês"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Fail' = falhar (condição negativa). 'Succeed' seria ter sucesso, mudando totalmente a ameaça."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 24,
    endTime: 30,
    audioText: "No snake has set foot in Zootopia in forever",
    level: "intermediate",
    options: [
      "Nenhuma cobra pisou em Zootopia há séculos",
      "Muitas cobras pisaram em Zootopia recentemente"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'No snake' = nenhuma cobra (ausência total). 'Many snakes' seria o oposto completo."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 36,
    endTime: 40,
    audioText: "We're going to crack this case and prove we're the greatest partners of all time",
    level: "advanced",
    options: [
      "Vamos resolver este caso e provar que somos os maiores parceiros de todos os tempos",
      "Vamos desistir deste caso e provar que somos os piores parceiros de todos os tempos"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Crack' = resolver. 'Greatest' = maiores. Opostos mudariam completamente a intenção."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 39,
    endTime: 46,
    audioText: "Yeah. If you want to talk to a reptile, I am your gal",
    level: "intermediate",
    options: [
      "Sim. Se você quer falar com um réptil, eu sou sua garota",
      "Não. Se você quer falar com um réptil, eu não posso ajudar"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'I am your gal' = eu sou a pessoa certa (oferecimento). Oposto seria recusar ajudar."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 45,
    endTime: 52,
    audioText: "When Zootopia was founded, this whole neighborhood got cut off from the rest of the town",
    level: "advanced",
    options: [
      "Quando Zootopia foi fundada, todo esse bairro foi isolado do resto da cidade",
      "Quando Zootopia foi fundada, todo esse bairro foi conectado ao resto da cidade"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Cut off' = isolado/separado. 'Connected' seria conectado, o oposto total."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 50,
    endTime: 54,
    audioText: "It's the only place you can get away with wearing a shirt and no pants",
    level: "advanced",
    options: [
      "É o único lugar onde você pode se safar usando uma camisa e sem calças",
      "É o único lugar onde você é obrigado a usar camisa e calças"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Get away with' = conseguir fazer sem problemas. 'Obrigado' seria o oposto (required/must)."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 55,
    endTime: 60,
    audioText: "Zootopia has a secret reptile population",
    level: "intermediate",
    options: [
      "Zootopia tem uma população secreta de répteis",
      "Zootopia não tem nenhuma população de répteis"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Has' = tem (existe). 'Doesn't have' seria não tem, negação total da afirmação."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 68,
    endTime: 73,
    audioText: "Whatever you're tangled up in has to do with snakes. It's dangerous",
    level: "advanced",
    options: [
      "Seja lá no que você está envolvido tem a ver com cobras. É perigoso",
      "Seja lá no que você está envolvido não tem a ver com cobras. É seguro"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Has to do with' = tem a ver com (relacionado). 'Doesn't have to do with' + 'safe' = opostos completos."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 73,
    endTime: 77,
    audioText: "I want the fox and rabbit gone",
    level: "beginner",
    options: [
      "Eu quero a raposa e o coelho fora daqui",
      "Eu quero a raposa e o coelho aqui"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Gone' = fora/embora (removidos). 'Here/to stay' seria o oposto (mantê-los)."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 77,
    endTime: 79,
    audioText: "Stop pulling my ears. Stop pulling my ears",
    level: "beginner",
    options: [
      "Pare de puxar minhas orelhas. Pare de puxar minhas orelhas",
      "Continue puxando minhas orelhas. Continue puxando minhas orelhas"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Stop' = parar (ordem para cessar). 'Keep/continue' seria continuar, oposto."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 91,
    endTime: 96,
    audioText: "Snakes aren't the bad guys. This is our chance to set things right",
    level: "advanced",
    options: [
      "Cobras não são os vilões. Esta é nossa chance de acertar as coisas",
      "Cobras são os vilões. Esta é nossa chance de eliminá-los"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Aren't the bad guys' = não são vilões (defesa). Sem 'aren't' + 'eliminate' muda completamente."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 98,
    endTime: 105,
    audioText: "We took an oath to make the world a better place. And an innocent snake needs our help",
    level: "advanced",
    options: [
      "Fizemos um juramento de tornar o mundo um lugar melhor. E uma cobra inocente precisa da nossa ajuda",
      "Fizemos um juramento de tornar o mundo um lugar melhor. E uma cobra perigosa precisa ser capturada"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Innocent' = inocente (vítima). 'Dangerous/needs to be caught' = perigosa (ameaça), oposto moral."
  },
  {
    videoId: "sEgPQ7HKoBA",
    startTime: 117,
    endTime: 122,
    audioText: "Hey, Flash. Flash 100yard dash. We need to get across town",
    level: "advanced",
    options: [
      "Ei, Flash. Flash corrida de 100 jardas. Precisamos atravessar a cidade",
      "Ei, Flash. Flash corrida de 100 jardas. Precisamos sair da cidade"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Get across town' = atravessar a cidade (de um lado ao outro). 'Leave town' = sair da cidade completamente."
  },
  {
    videoId: "SyWKhDYf-w8",
    startTime: 2,
    endTime: 5,
    audioText: "So, what are we driving?",
    level: "beginner",
    options: [
      "Então, o que estamos dirigindo?",
      "Então, onde estamos indo?"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'What are we driving' = qual carro (objeto). 'Where are we going' = para onde (destino)."
  },
  {
    videoId: "SyWKhDYf-w8",
    startTime: 4,
    endTime: 7,
    audioText: "If you can guess, I'll give you the keys to it",
    level: "intermediate",
    options: [
      "Se você conseguir adivinhar, darei as chaves para você",
      "Se você não conseguir adivinhar, darei as chaves para você"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'If you can' = se conseguir (condição positiva). 'If you can't' seria condição negativa, oposta."
  },
  {
    videoId: "SyWKhDYf-w8",
    startTime: 11,
    endTime: 15,
    audioText: "That is a beautiful car. I need to be in your line of work",
    level: "intermediate",
    options: [
      "Esse é um carro lindo. Preciso estar na sua área de trabalho",
      "Esse é um carro horrível. Preciso evitar sua área de trabalho"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Beautiful' = lindo (admiração). 'Horrible/need to avoid' = horrível/evitar (rejeição)."
  },
  {
    videoId: "SyWKhDYf-w8",
    startTime: 23,
    endTime: 26,
    audioText: "I'm real good at reading people",
    level: "beginner",
    options: [
      "Sou muito bom em ler pessoas",
      "Sou muito ruim em ler pessoas"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Real good' = muito bom (habilidade). 'Real bad' seria muito ruim, oposto."
  },
  {
    videoId: "SyWKhDYf-w8",
    startTime: 29,
    endTime: 33,
    audioText: "You look like a person who has secrets",
    level: "intermediate",
    options: [
      "Você parece uma pessoa que tem segredos",
      "Você parece uma pessoa muito transparente"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Has secrets' = tem segredos (oculta coisas). 'Transparent/open' seria transparente, oposto."
  },
  {
    videoId: "SyWKhDYf-w8",
    startTime: 32,
    endTime: 38,
    audioText: "You got the cars, the clothes. You can't seem to look me in the eye",
    level: "advanced",
    options: [
      "Você tem os carros, as roupas. Você não consegue me olhar nos olhos",
      "Você tem os carros, as roupas. Você sempre me olha nos olhos"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'Can't look in the eye' = não consegue olhar nos olhos (evita, esconde algo). 'Always looks' = oposto."
  },
  {
    videoId: "SyWKhDYf-w8",
    startTime: 42,
    endTime: 48,
    audioText: "You're looking at robberies of jewels, money, or high value items in the last four years",
    level: "advanced",
    options: [
      "Você está vendo roubos de joias, dinheiro ou itens de alto valor nos últimos quatro anos",
      "Você está vendo roubos de joias, dinheiro ou itens sem valor nos últimos quatro anos"
    ],
    correctIndex: 0,
    category: "Movies",
    explanation: "'High value items' = itens de alto valor (caros/importantes). 'Low value/worthless' = sem valor."
  },
  {
      videoId: "SyWKhDYf-w8",
      startTime: 50,
      endTime: 55,
      audioText: "Now remove every robbery where there was DNA left at the scene",
      level: "advanced",
      options: [
        "Agora remova todo roubo onde havia DNA deixado na cena",
        "Agora adicione todo roubo onde havia DNA deixado na cena"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Remove' = remover/tirar. 'Add' seria adicionar, ação oposta."
    },
    {
      videoId: "SyWKhDYf-w8",
      startTime: 58,
      endTime: 62,
      audioText: "I think all of these are the same guy",
      level: "intermediate",
      options: [
        "Acho que todos esses são o mesmo cara",
        "Acho que todos esses são caras diferentes"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Same guy' = mesmo cara (um único criminoso). 'Different guys' = vários criminosos diferentes."
    },
    {
      videoId: "SyWKhDYf-w8",
      startTime: 60,
      endTime: 65,
      audioText: "and he hits every time along the 101 freeway",
      level: "intermediate",
      options: [
        "e ele ataca toda vez ao longo da rodovia 101",
        "e ele nunca ataca na rodovia 101"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Hits every time' = ataca sempre (padrão consistente). 'Never hits' = nunca ataca, oposto."
    },
    {
      videoId: "SyWKhDYf-w8",
      startTime: 108,
      endTime: 114,
      audioText: "I came here to make you a business proposition",
      level: "intermediate",
      options: [
        "Vim aqui para te fazer uma proposta de negócios",
        "Vim aqui para te ameaçar"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Business proposition' = proposta de negócios (oferta comercial). 'Threaten' = ameaçar (hostil)."
    },
    {
      videoId: "SyWKhDYf-w8",
      startTime: 119,
      endTime: 124,
      audioText: "I easily make them disappear and no one gets hurt",
      level: "intermediate",
      options: [
        "Eu facilmente faço eles desaparecerem e ninguém se machuca",
        "Eu facilmente faço eles desaparecerem e todos se machucam"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'No one gets hurt' = ninguém se machuca (não violento). 'Everyone gets hurt' = todos se machucam."
    },
    {
      videoId: "SyWKhDYf-w8",
      startTime: 123,
      endTime: 127,
      audioText: "I wouldn't die for an insurance company",
      level: "beginner",
      options: [
        "Eu não morreria por uma seguradora",
        "Eu morreria por uma seguradora"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Wouldn't die for' = não morreria por (não vale a pena). Sem 'wouldn't' = oposto."
    },
    {
      videoId: "SyWKhDYf-w8",
      startTime: 39,
      endTime: 42,
      audioText: "Doesn't matter how much money you make, it's never enough",
      level: "advanced",
      options: [
        "Não importa quanto dinheiro você ganha, nunca é suficiente",
        "Não importa quanto dinheiro você ganha, sempre é suficiente"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Never enough' = nunca é suficiente (insatisfação). 'Always enough' = sempre suficiente."
    },
    {
      videoId: "SyWKhDYf-w8",
      startTime: 158,
      endTime: 161,
      audioText: "As smart as that guy is, he can't help but form a pattern",
      level: "advanced",
      options: [
        "Por mais inteligente que esse cara seja, ele não pode evitar formar um padrão",
        "Por mais burro que esse cara seja, ele sempre quebra qualquer padrão"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'As smart as' = por mais inteligente. 'Can't help but' = não consegue evitar. Opostos mudam tudo."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 0,
      endTime: 6,
      audioText: "This... is the only pure thing in this world.",
      level: "advanced",
      options: [
        "Isso... é a única coisa pura neste mundo",
        "Isso... é a coisa mais corrompida neste mundo"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Only pure thing' = única coisa pura (especial/limpa). 'Most corrupt' = mais corrompida."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 6,
      endTime: 13,
      audioText: "The fire came from the mountain. Burnt our forests.",
      level: "advanced",
      options: [
        "O fogo veio da montanha. Queimou nossas florestas",
        "O fogo veio da montanha. Salvou nossas florestas"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Burnt' = queimou (destruiu). 'Saved' = salvou, oposto completo."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 12,
      endTime: 22,
      audioText: "My people... cried for help... but Eywa did not come.",
      level: "advanced",
      options: [
        "Meu povo... pediu ajuda... mas Eywa não veio",
        "Meu povo... pediu ajuda... e Eywa veio imediatamente"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Did not come' = não veio (abandono). 'Came immediately' = veio imediatamente (socorro)."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 40,
      endTime: 45,
      audioText: "This world goes much deeper than you imagine.",
      level: "advanced",
      options: [
        "Este mundo vai muito mais profundo do que você imagina",
        "Este mundo é mais superficial do que você imagina"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Goes much deeper' = vai muito mais fundo (complexo). 'Superficial' = raso, oposto."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 62,
      endTime: 65,
      audioText: "Protect your sisters. Stay under cover.",
      level: "advanced",
      options: [
        "Proteja suas irmãs. Fique protegido",
        "Abandone suas irmãs. Saia do esconderijo"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Protect' = proteger. 'Stay under cover' = ficar escondido. Opostos = abandone/saia."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 74,
      endTime: 79,
      audioText: "What does Dad always say? Sullys stick together.",
      level: "advanced",
      options: [
        "O que o papai sempre diz? Sullys ficam juntos",
        "O que o papai sempre diz? Sullys se separam"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Stick together' = ficar juntos (união). 'Split up' = separar-se."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 77,
      endTime: 81,
      audioText: "Sullys never quit. That's right. Sullys never quit.",
      level: "advanced",
      options: [
        "Sullys nunca desistem. Isso mesmo. Sullys nunca desistem",
        "Sullys sempre desistem. Isso mesmo. Sullys sempre desistem"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Never quit' = nunca desistir (perseverança). 'Always quit' = sempre desistir."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 82,
      endTime: 90,
      audioText: "How do you still live? What if every human being on Earth could live here without a mask?",
      level: "advanced",
      options: [
        "Como você ainda vive? E se todo ser humano na Terra pudesse viver aqui sem máscara?",
        "Como você ainda vive? E se nenhum ser humano na Terra pudesse viver aqui sem máscara?"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Every human could' = todos poderiam (possibilidade positiva). 'No human could' = nenhum poderia."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 90,
      endTime: 94,
      audioText: "Then the Na'vi people will be gone.",
      level: "advanced",
      options: [
        "Então o povo Na'vi terá desaparecido",
        "Então o povo Na'vi será salvo"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Will be gone' = desaparecerá/será extinto. 'Will be saved' = será salvo."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 100,
      endTime: 106,
      audioText: "You wanna spread your fire across the world, you need me.",
      level: "advanced",
      options: [
        "Você quer espalhar seu fogo pelo mundo, você precisa de mim",
        "Você quer conter seu fogo no mundo, você não precisa de mim"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Spread across' = espalhar por todo. 'Contain/don't need' = conter/não precisa."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 109,
      endTime: 112,
      audioText: "We must fight!",
      level: "advanced",
      options: [
        "Nós devemos lutar!",
        "Nós devemos nos render!"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Must fight' = devemos lutar (resistir). 'Must surrender' = devemos nos render."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 115,
      endTime: 117,
      audioText: "I call upon the warrior mother.",
      level: "advanced",
      options: [
        "Eu invoco a mãe guerreira",
        "Eu rejeito a mãe guerreira"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Call upon' = invocar/chamar (pedir ajuda). 'Reject' = rejeitar."
    },
    {
      videoId: "Ma1x7ikpid8",
      startTime: 135,
      endTime: 138,
      audioText: "I'll kill you, I swear!",
      level: "advanced",
      options: [
        "Eu vou te matar, eu juro!",
        "Eu vou te salvar, eu juro!"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Kill' = matar (ameaça). 'Save' = salvar, oposto total."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 5,
      endTime: 7,
      audioText: "A great stirring is underway",
      level: "intermediate",
      options: [
        "Uma grande agitação está em andamento",
        "Uma grande calmaria está em andamento"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Stirring' = agitação/movimento. 'Calm' = calmaria, oposto."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 14,
      endTime: 16,
      audioText: "War is inevitable",
      level: "beginner",
      options: [
        "A guerra é inevitável",
        "A guerra pode ser evitada"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Inevitable' = inevitável (vai acontecer). 'Can be avoided' = pode ser evitada."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 26,
      endTime: 33,
      audioText: "There are forces more powerful than the will of the gods, my son",
      level: "advanced",
      options: [
        "Há forças mais poderosas que a vontade dos deuses, meu filho",
        "Não há forças mais poderosas que a vontade dos deuses, meu filho"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'More powerful than' = mais poderoso que (superioridade). 'No forces more powerful' = nega a superioridade."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 37,
      endTime: 39,
      audioText: "Brace yourself",
      level: "beginner",
      options: [
        "Prepare-se",
        "Relaxe"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Brace yourself' = prepare-se (para algo difícil). 'Relax' = relaxar, oposto."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 42,
      endTime: 49,
      audioText: "Look, Peter, we all know that last year you did something cool",
      level: "intermediate",
      options: [
        "Olha, Peter, nós todos sabemos que no ano passado você fez algo legal",
        "Olha, Peter, ninguém sabe o que você fez no ano passado"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'We all know' = todos sabemos (conhecimento comum). 'Nobody knows' = ninguém sabe."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 47,
      endTime: 50,
      audioText: "But honestly, I don't even remember what it was",
      level: "intermediate",
      options: [
        "Mas honestamente, eu nem lembro o que era",
        "Mas honestamente, eu lembro perfeitamente o que era"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Don't even remember' = nem lembro (esqueceu). 'Remember perfectly' = lembra perfeitamente."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 54,
      endTime: 58,
      audioText: "We're headed into the sea of monsters",
      level: "intermediate",
      options: [
        "Estamos indo para o mar de monstros",
        "Estamos fugindo do mar de monstros"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Headed into' = indo em direção a. 'Fleeing from' = fugindo de."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 57,
      endTime: 65,
      audioText: "You sure you're okay to do this?",
      level: "beginner",
      options: [
        "Você tem certeza que está bem para fazer isso?",
        "Você tem certeza que não está bem para fazer isso?"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Okay to do' = bem para fazer (capaz). 'Not okay' = não está bem."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 64,
      endTime: 79,
      audioText: "Let's go do the impossible",
      level: "intermediate",
      options: [
        "Vamos fazer o impossível",
        "Vamos fazer o óbvio"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'The impossible' = o impossível (desafio extremo). 'The obvious' = o óbvio (fácil)."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 83,
      endTime: 85,
      audioText: "So, this is your boyfriend, huh?",
      level: "beginner",
      options: [
        "Então, esse é seu namorado, né?",
        "Então, esse não é seu namorado, né?"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'This is' = esse é (afirmação). 'This isn't' = esse não é (negação)."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 84,
      endTime: 88,
      audioText: "I never said boyfriend. I never said boyfriend",
      level: "beginner",
      options: [
        "Eu nunca disse namorado. Eu nunca disse namorado",
        "Eu sempre disse namorado. Eu sempre disse namorado"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Never said' = nunca disse (nega). 'Always said' = sempre disse."
    },
    {
      videoId: "82xS4goDWZY",
      startTime: 87,
      endTime: 91,
      audioText: "I believe you",
      level: "beginner",
      options: [
        "Eu acredito em você",
        "Eu não acredito em você"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'I believe you' = acredito em você (confia). 'I don't believe you' = não acredito."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 2,
      endTime: 6,
      audioText: "We have apprehended a dangerous experimental",
      level: "intermediate",
      options: [
        "Nós apreendemos um experimental perigoso",
        "Nós libertamos um experimental perigoso"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Apprehended' = apreendeu/capturou. 'Released' = liberou, oposto."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 6,
      endTime: 10,
      audioText: "Where is he? He escaped",
      level: "beginner",
      options: [
        "Onde ele está? Ele escapou",
        "Onde ele está? Ele foi capturado"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Escaped' = escapou (livre). 'Was captured' = foi capturado."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 9,
      endTime: 12,
      audioText: "He's trying to find the police cruisers",
      level: "intermediate",
      options: [
        "Ele está tentando encontrar os cruzadores policiais",
        "Ele está tentando evitar os cruzadores policiais"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Trying to find' = tentando encontrar (buscar). 'Trying to avoid' = tentando evitar."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 12,
      endTime: 17,
      audioText: "He took the red one",
      level: "beginner",
      options: [
        "Ele pegou o vermelho",
        "Ele pegou o azul"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Red one' = o vermelho. 'Blue one' = o azul, cor diferente."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 16,
      endTime: 22,
      audioText: "What hideous planet is caught in your crosshairs?",
      level: "advanced",
      options: [
        "Que planeta hediondo está preso na sua mira?",
        "Que planeta maravilhoso está preso na sua mira?"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Hideous' = hediondo/horrível. 'Beautiful/wonderful' = maravilhoso, oposto."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 24,
      endTime: 30,
      audioText: "I wish for a friend, like a best friend",
      level: "beginner",
      options: [
        "Eu desejo um amigo, como um melhor amigo",
        "Eu não quero nenhum amigo"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'I wish for a friend' = desejo um amigo (quer companhia). 'Don't want any friend' = não quer amigo."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 43,
      endTime: 47,
      audioText: "He's so cute and fluffy",
      level: "beginner",
      options: [
        "Ele é tão fofo e peludo",
        "Ele é tão assustador e perigoso"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Cute and fluffy' = fofo e peludo (adorável). 'Scary and dangerous' = assustador e perigoso."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 46,
      endTime: 51,
      audioText: "He is your responsibility, got it?",
      level: "intermediate",
      options: [
        "Ele é sua responsabilidade, entendeu?",
        "Ele não é sua responsabilidade, entendeu?"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Is your responsibility' = é sua responsabilidade (você deve cuidar). 'Isn't' = não é."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 51,
      endTime: 57,
      audioText: "Get down from there",
      level: "beginner",
      options: [
        "Desça de lá",
        "Suba aí"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Get down' = descer. 'Get up/climb up' = subir, oposto."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 64,
      endTime: 71,
      audioText: "No dogs on the table",
      level: "beginner",
      options: [
        "Nenhum cachorro na mesa",
        "Todos os cachorros na mesa"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'No dogs' = nenhum cachorro (proibição). 'All dogs' = todos os cachorros."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 78,
      endTime: 82,
      audioText: "We are not keeping this thing",
      level: "intermediate",
      options: [
        "Nós não vamos ficar com essa coisa",
        "Nós vamos ficar com essa coisa"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Not keeping' = não vamos ficar (rejeitar). Sem 'not' = vamos ficar (aceitar)."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 81,
      endTime: 89,
      audioText: "Family means nobody gets left behind or forgotten",
      level: "intermediate",
      options: [
        "Família significa que ninguém fica para trás ou esquecido",
        "Família significa que alguns ficam para trás ou esquecidos"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Nobody gets left behind' = ninguém fica para trás (todos incluídos). 'Some get left' = alguns ficam."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 88,
      endTime: 97,
      audioText: "Sometimes family isn't perfect",
      level: "intermediate",
      options: [
        "Às vezes a família não é perfeita",
        "Às vezes a família é sempre perfeita"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Isn't perfect' = não é perfeita (tem falhas). 'Is always perfect' = é sempre perfeita."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 92,
      endTime: 97,
      audioText: "That doesn't mean they aren't good",
      level: "intermediate",
      options: [
        "Isso não significa que eles não são bons",
        "Isso significa que eles não são bons"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Doesn't mean they aren't good' = não significa que não são bons (ainda são bons). Sem 'doesn't' = confirma que não são bons."
    },
    {
      videoId: "VWqJifMMgZE",
      startTime: 98,
      endTime: 106,
      audioText: "I don't think you're supposed to drink that",
      level: "advanced",
      options: [
        "Eu não acho que você deveria beber isso",
        "Eu acho que você deveria beber isso"
      ],
      correctIndex: 0,
      category: "Movies",
      explanation: "'Don't think you're supposed to' = não deveria (desaconselhamento). Sem 'don't' = deveria."
    }
];

export default questions;