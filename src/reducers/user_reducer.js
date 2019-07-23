export default function(
  state = {
    logo: null,
    email: null,
    nome: null,
    sobrenome: null,
    ativo: null,
    tipo_morador: false,
    telefone: null,
    role: null,
    id: null,
    username: null,
    jwt: null,
    funcao: null,
    assinatura: null,
    condominios: [],
    construtoras: [],
    unidadesAutonomas: [],
    tipologias: [],
    unidades: [],
    fotosChamados: [],
    chamado: [],
    permissoes: null
  },
  action
) {
  switch (action.type) {
    case 'USER_LOGGEDIN':
      return {
        ...state,
        logo: action.payload.logo || state.null,
        email: action.payload.email || state.email,
        nome: action.payload.nome || state.nome,
        sobrenome: action.payload.sobrenome || state.sobrenome,
        telefone: action.payload.telefone || state.telefone,
        ativo: action.payload.ativo || state.ativo,
        tipo_morador: action.payload.tipo_morador || state.tipo_morador,
        role: action.payload.role || state.role,
        id: action.payload.id || state.id,
        funcao: action.payload.funcao || state.funcao,
        assinatura: action.payload.assinatura || state.assinatura,
        condominios: action.payload.condominios || state.condominios,
        construtoras: action.payload.construtoras || state.construtoras,
        unidadesAutonomas:
          action.payload.unidadesAutonomas || state.unidadesAutonomas,
        tipologias: action.payload.tipologias || state.tipologias,
        unidades: action.payload.unidades || state.unidades,
        fotosChamado: action.payload.fotosChamado || state.fotosChamado,
        chamado: action.payload.chamado || state.chamado,
        username: action.payload.username || state.username,
        permissoes: action.payload.permissoes || state.permissoes,
        jwt: action.payload.jwt || state.jwt
      };
    case 'USER_LOGGEDOUT':
      return {
        ...state,
        logo: null,
        email: null,
        nome: null,
        sobrenome: null,
        ativo: null,
        tipo_morador: false,
        telefone: null,
        role: null,
        id: null,
        username: null,
        jwt: null,
        funcao: null,
        assinatura: null,
        condominios: [],
        construtoras: [],
        unidadesAutonomas: [],
        tipologias: [],
        unidades: [],
        fotosChamados: [],
        chamado: [],
        permissoes: null
      };
    case 'GET_ME_SUCCESS':
      return {
        ...state,
        data: action.payload
      };
    case 'GET_ME_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
}
