import React from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Layout,
  Form,
  Input,
  Icon,
  Button,
  notification,
  Divider,
  message
} from 'antd';
import * as axios from 'axios';
import { url } from '../../utilities/constants';
import { saveUser } from '../../actions/userActions';
import DadosCondominios from './table';
import ModalAvatar from './avatar';

const { Content } = Layout;

const styles = {
  centralizado: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  esquerda: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
};

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class Perfil extends React.Component {
  state = {
    enviando: false,
    imagem: null,
    tipo_morador: 1,
    ativo: 1
  };

  saveImage = img => {
    this.setState({ imagem: img });
  };

  componentDidMount = () => {
    this.props.form.validateFields();
  };

  tipoChange = e => {
    this.setState({
      tipo_morador: e.target.value
    });
  };

  onChange = e => {
    this.setState({
      ativo: e.target.value
    });
  };

  handleUpdate = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ enviando: true });

        let auth = localStorage.getItem('jwt') || this.props.user.jwt;
        let config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        axios
          .put(
            `${url}/users/${localStorage.getItem('id') ||
              this.props.user._id ||
              this.props.user.id}`,
            {
              logo: this.state.imagem,
              nome: values.nome,
              sobrenome: values.sobrenome,
              username: values.username,
              telefone: values.telefone
            },
            config
          )
          .then(res => {
            this.props.dispatch(
              saveUser({
                logo: this.state.imagem,
                nome: values.nome,
                sobrenome: values.sobrenome,
                username: values.username,
                telefone: values.telefone
              })
            );
            this.props.form.resetFields();
            this.props.form.validateFields();
            this.setState({ enviando: false, imagem: null });
          })
          .catch(error => {
            message.error('Erro ao tentar atualizar seus dados !');
            console.log(error);
            this.setState({ enviando: false, imagem: null });
          });
      } else {
        message.warning('Por favor, preencha todos os campos !');
        this.setState({ enviando: false });
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

    const emailError = isFieldTouched('email') && getFieldError('email');
    const nomeError = isFieldTouched('nome') && getFieldError('nome');
    const sobrenomeError =
      isFieldTouched('sobrenome') && getFieldError('sobrenome');
    const usernameError =
      isFieldTouched('username') && getFieldError('username');
    const telefoneError =
      isFieldTouched('password') && getFieldError('password');

    return (
      <Content style={{ padding: '0 50px', marginTop: '2rem' }}>
        <div style={{ background: '#fff' }}>
          <Row>
            <Col span={8} style={styles.centralizado}>
              <ModalAvatar
                imagem={this.state.imagem}
                saveImage={this.saveImage}
              />
            </Col>
            <Col span={16} style={styles.esquerda}>
              <Form
                onSubmit={this.handleUpdate}
                className="login-form"
                style={{ width: '70%', marginTop: '1rem' }}
              >
                <h2>
                  <span>
                    Bem vindo {user.nome} {user.sobrenome}
                  </span>
                </h2>
                <FormItem
                  validateStatus={emailError ? 'error' : ''}
                  help={emailError || ''}
                  label="E-mail"
                >
                  {getFieldDecorator('email', {
                    initialValue: user.email,
                    rules: [
                      {
                        required: true,
                        message: 'Por favor entre com seu e-mail!'
                      }
                    ]
                  })(
                    <Input
                      prefix={<Icon type="mail" />}
                      placeholder="Email"
                      disabled
                    />
                  )}
                </FormItem>
                <Row gutter={16}>
                  <Col span={12}>
                    <FormItem
                      validateStatus={nomeError ? 'error' : ''}
                      help={nomeError || ''}
                      label="Nome"
                    >
                      {getFieldDecorator('nome', {
                        initialValue: user.nome,
                        rules: [
                          {
                            required: true,
                            message: 'Por favor entre com nome!'
                          }
                        ]
                      })(<Input type="text" placeholder="Nome" />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      validateStatus={sobrenomeError ? 'error' : ''}
                      help={sobrenomeError || ''}
                      label="Sobrenome"
                    >
                      {getFieldDecorator('sobrenome', {
                        initialValue: user.sobrenome,
                        rules: [
                          {
                            required: true,
                            message: 'Por favor entre com sobrenome!'
                          }
                        ]
                      })(<Input type="text" placeholder="Sobrenome" />)}
                    </FormItem>
                  </Col>
                </Row>
                <FormItem
                  validateStatus={usernameError ? 'error' : ''}
                  help={usernameError || ''}
                  label="Username"
                >
                  {getFieldDecorator('username', {
                    initialValue: user.username,
                    rules: [
                      {
                        required: true,
                        message: 'Por favor entre com username!'
                      }
                    ]
                  })(
                    <Input
                      prefix={<Icon type="user" />}
                      type="text"
                      placeholder="Username"
                    />
                  )}
                </FormItem>
                <FormItem
                  validateStatus={telefoneError ? 'error' : ''}
                  help={telefoneError || ''}
                  label="Telefone"
                >
                  {getFieldDecorator('telefone', {
                    initialValue: user.telefone,
                    rules: [
                      {
                        required: true,
                        message: 'Por favor entre com sua senha!'
                      }
                    ]
                  })(
                    <Input
                      prefix={<Icon type="phone" />}
                      type="text"
                      placeholder="Telefone"
                      onChange={this.phoneMask}
                    />
                  )}
                </FormItem>
                <FormItem>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                    style={{ width: '100%' }}
                    loading={this.state.enviando}
                    disabled={hasErrors(getFieldsError())}
                  >
                    Salvar
                  </Button>
                </FormItem>
              </Form>
            </Col>
          </Row>
          <Divider />
          <Row type="flex" justify="center">
            <Col span={20}>
              <DadosCondominios />
            </Col>
          </Row>
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: '-1',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            height: '100vh',
            backgroundColor: '#f0f2f5',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </Content>
    );
  }
}

let DadosPerfil = Form.create()(Perfil);

export default (DadosPerfil = connect(store => {
  return {
    user: store.user
  };
})(DadosPerfil));
