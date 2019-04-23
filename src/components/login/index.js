import React from 'react';
import { Layout, Row, Col } from 'antd';
import Baixo from '../footer/index';
import './login.css';
import LoginForm from './Form';

const { Content } = Layout;

class Login extends React.Component {
  render() {
    return (
      <Content>
        <Row>
          <Col span={12} className="home">
            <img src={require('../../images/logo.png')} alt="logo" id="logo" />
            <Content>
              <h2
                style={{
                  color: '#fff',
                  padding: '10px',
                  textAlign: 'center'
                }}
              >
                Nós facilitamos o contato entre cliente e construtor! <br />
                Conhece agora nossa plataforma e aumente a satisfação dos seus
                clientes.
              </h2>
            </Content>
          </Col>
          <LoginForm />
        </Row>
      </Content>
    );
  }
}

export default Login;
