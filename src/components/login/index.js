import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  Form,
  Icon,
  Input,
  Button,
  Col,
  notification,
  message,
  Layout,
  Row,
  Card
} from 'antd';
import * as axios from 'axios';
import { connect } from 'react-redux';

// utilities
import { url } from '../../utilities/constants';
import { saveUser } from '../../actions/userActions';

import Baixo from '../footer/index';
import './login.css';

const FormItem = Form.Item;
const { Content } = Layout;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class LoginForm extends React.Component {
  state = {
    loading: false
  };

  handleSubmit = e => {
    e.preventDefault();
    let objUser = {};
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        axios
          .post(`${url}/auth/local`, {
            identifier: values.email,
            password: values.password
          })
          .then(res => {
            localStorage.setItem('id', res.data.user._id);
            localStorage.setItem('jwt', res.data.jwt);
            localStorage.setItem('tipo_morador', res.data.user.tipo_morador);
            objUser = {
              logo: res.data.user.logo,
              jwt: res.data.jwt || localStorage.getItem('jwt'),
              id: res.data.user._id || localStorage.getItem('id'),
              email: res.data.user.email,
              role: res.data.user.role.type,
              ativo: res.data.user.ativo ? 1 : 0,
              tipo_morador: res.data.tipo_morador,
              username: res.data.user.username,
              nome: res.data.user.nome,
              sobrenome: res.data.user.sobrenome,
              telefone: res.data.user.telefone,
              permissoes: res.data.user.permissoes,
              fotosChamado: res.data.user.fotosChamado
            };
            this.props.dispatch(saveUser(objUser));
            const config = {
              headers: { Authorization: 'Bearer ' + res.data.jwt }
            };
            axios
              .get(`${url}/users/me`, config)
              .then(res => {
                this.props.dispatch(
                  saveUser({
                    ...objUser,
                    condominios: res.data.condominios,
                    construtoras: res.data.construtoras,
                    unidadesAutonomas: res.data.unidadesAutonomas,
                    fotosChamado: res.data.fotosChamado,
                    chamado: res.data.chamado
                  })
                );
              })
              .catch(error => console.log(error));
          })
          .catch(error => {
            console.log(error);
            notification.open({
              message: 'Opps!',
              description: 'Usuário ou senha incorreta'
            });
          });
        this.setState({ loading: false });
      }
    });
  };

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched
    } = this.props.form;
    const { user } = this.props;

    if ((user.jwt && user.role === 'root') || user.role === 'funcionario') {
      message.success(
        'Escolha uma das opções do menu ao lado para navegação',
        3
      );
      return <Redirect to="/admin" />;
    }

    if (user.jwt && user.role === 'authenticated') {
      return <Redirect to="/configuracoes" />;
    }

    const userNameError = isFieldTouched('email') && getFieldError('email');
    const passwordError =
      isFieldTouched('password') && getFieldError('password');
    return (
      <Content>
        <Row>
          <Col span={8} />
          <Col span={8}>
            <Card
              className="title-login"
              title="Login"
              bordered={false}
              style={{ width: '80%', marginTop: '10rem' }}
            >
              <Form onSubmit={this.handleSubmit}>
                {/* <h1 className="title-login">Login</h1> */}
                <FormItem
                  validateStatus={userNameError ? 'error' : ''}
                  help={userNameError || ''}
                >
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        required: true,
                        message: 'Por favor entre com seu email ou username!'
                      }
                    ]
                  })(
                    <Input
                      prefix={<Icon type="mail" />}
                      placeholder="Email ou username"
                    />
                  )}
                </FormItem>
                <FormItem
                  validateStatus={passwordError ? 'error' : ''}
                  help={passwordError || ''}
                >
                  {getFieldDecorator('password', {
                    rules: [
                      {
                        required: true,
                        message: 'Por favor entre com sua senha!'
                      }
                    ]
                  })(
                    <Input.Password
                      prefix={<Icon type="lock" />}
                      type="password"
                      placeholder="Password"
                    />
                  )}
                </FormItem>
                <FormItem style={{ marginTop: 0 }}>
                  <a className="login-form-forgot" href="">
                    Esqueci minha senha
                  </a>
                </FormItem>
                <FormItem>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                    style={{ width: '100%' }}
                    loading={this.state.loading}
                    disabled={hasErrors(getFieldsError())}
                  >
                    Entrar
                  </Button>
                </FormItem>
              </Form>
            </Card>
          </Col>
          <Col span={8} />
        </Row>
      </Content>
    );
  }
}

let Login = Form.create()(LoginForm);
export default (Login = connect(store => {
  return {
    user: store.user
  };
})(Login));
