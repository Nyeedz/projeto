import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import { url } from '../../utilities/constants';
import { saveUser } from '../../actions/userActions';

export default WrappedComponent => {
  class RequireAuth extends React.Component {
    static contextTypes = {
      router: PropTypes.object
    };

    componentDidMount() {
      const jwt = localStorage.getItem('jwt') || this.props.user.jwt;
      const id = localStorage.getItem('id') || this.props.user.id;
      if (!jwt && this.props.user.jwt == null) {
        this.context.router.history.push('/');
      }

      if (jwt && this.props.user.jwt == null) {
        axios
          .get(`${url}/users/me`, {
            headers: {
              Authorization: `Bearer ${jwt}`
            }
          })
          .then(res => {
            this.props.dispatch(
              saveUser({
                logo: res.data.logo,
                jwt: jwt || res.jwt,
                id: id || res.data.id,
                email: res.data.email,
                construtoras: res.data.construtoras,
                condominios: res.data.condominios,
                unidadesautonomas: res.data.unidadesautonomas,
                fotosChamado: res.data.fotosChamado,
                role: res.data.role.type,
                username: res.data.username,
                nome: res.data.nome,
                sobrenome: res.data.sobrenome,
                telefone: res.data.telefone,
                ativo: res.data.ativo ? 1 : 0,
                tipo_morador: res.data.tipo_morador,
                permissoes: res.data.permissoes
              })
            );
            this.context.router.history.push(
              this.context.router.route.location.pathname
            );
          })
          .catch(error => {
            localStorage.clear();
            this.context.router.history.push('/');
          });
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  return (RequireAuth = connect(store => {
    return {
      user: store.user
    };
  })(RequireAuth));
};
