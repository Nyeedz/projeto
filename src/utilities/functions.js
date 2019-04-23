export function getCodePath(path) {
  switch (path) {
    case '/admin/construtora':
      return 0;

    case '/admin/condominio':
      return 1;

    case '/admin/tipologia':
      return 2;

    case '/admin/unidade-autonoma':
      return 3;

    case '/admin/areas-gerais':
      return 4;

    case '/admin/areas-comuns':
      return 5;

    case '/admin/parametrizacao':
      return 6;

    case '/admin/garantia':
      return 7;

    case '/admin/pesquisa':
      return 8;

    case '/admin/clientes':
      return 9;

    case '/admin/chamados':
      return 10;
    default:
      return null;
  }
}
