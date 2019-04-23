import { combineReducers } from 'redux';
import User from './user_reducer';
import Construtoras from './construtora_reducer';
import Condominios from './condominio_reducer';
import Parametrizacao from './parametrizacao_reducer';
import Garantias from './garantia_reducer';
import Torre from './torre_reducer';
import Unidade from './unidadeAutonoma_reducer';
import AreasGerais from './areasGerais_reducer';
import AreasComuns from './areasComuns_reducer';
import Funcionarios from './funcionarios_reducer';
import Clientes from './cliente_reducer.js';
import Chamados from './chamados_reducer';

export default combineReducers({
  user: User,
  construtoras: Construtoras,
  condominios: Condominios,
  parametrizacao: Parametrizacao,
  funcionarios: Funcionarios,
  garantias: Garantias,
  torre: Torre,
  unidade: Unidade,
  areasGerais: AreasGerais,
  areasComuns: AreasComuns,
  clientes: Clientes,
  chamados: Chamados
});
