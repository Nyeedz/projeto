export const verificarPermissao = (rotaAtual, permissoesUsuario) => {
  //Verifica se usuário tem permissão full
  const isFull =
    permissoesUsuario.full.find(permissao => {
      return permissao === rotaAtual;
    }) !== -1;

  if (isFull) {
    return {
      permitido: true,
      type: 0
    };
  }

  //Verifica se é readyOnly
  const isReadyOnly =
    permissoesUsuario.readyOnly.find(permissao => {
      return permissao === rotaAtual;
    }) !== -1;

  if (isReadyOnly) {
    return {
      permitido: true,
      type: 1
    };
  }

  return {
    permitido: false,
    type: null
  };
};
