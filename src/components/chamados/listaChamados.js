import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Layout, Form } from 'antd';
import axios from 'axios';
import { url } from '../../utilities/constants';

const { Content } = Layout;

class Chamados extends React.Component {
  state = {
    loading: false
  };

  componentDidMount = () => {
    this.fetch();
  };

  fetch = () => {
    this.setState({ loading: true });

    let auth = localStorage.getItem('jwt') || this.props.user.jwt;
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    this.props.user.chamado.map(chamado => {
      console.log(chamado);
    });
  };

  render() {
    return (
      <Content>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, .1)',
            padding: 5
          }}
        >
          <h2>
            <span>Lista chamados</span>
          </h2>
        </div>
      </Content>
    );
  }
}

let ListaChamados = Form.create()(Chamados);
export default (ListaChamados = connect(store => {
  return {
    user: store.user
  };
})(ListaChamados));
