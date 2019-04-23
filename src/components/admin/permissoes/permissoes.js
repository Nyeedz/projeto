import React from 'react';
import { connect } from 'react-redux';
class Permissao extends React.PureComponent {
  isPermitido = () => {
    const codTela = this.props.codTela;
    const permissoes = this.props.permissoes;
    const permissaoNecessaria = this.props.permissaoNecessaria;

    if (
      codTela == null ||
      permissoes == null ||
      permissaoNecessaria == null ||
      typeof codTela !== 'number' ||
      (
        typeof permissaoNecessaria !== 'number' &&
        typeof permissaoNecessaria !== 'object'
      )
    ) {
      return false
    }

    const permissaoUsuario = permissoes[codTela] ? permissoes[codTela].status : 0;

    if (typeof permissaoNecessaria === 'object') {
      return permissaoNecessaria.indexOf(permissaoUsuario) !== -1
    }
    return permissaoUsuario === parseInt(permissaoNecessaria);

  };

  render() {
    return (
      <React.Fragment>
        {this.isPermitido() ? this.props.children : <span>{
          this.props.segundaOpcao
        }</span>}
      </React.Fragment>
    );
  }
}
export default (Permissao = connect(store => {
  return {
    permissoes: store.user.permissoes
  };
})(Permissao));