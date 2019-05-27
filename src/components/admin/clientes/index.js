import React from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Layout,
  Form,
  Input,
  Select,
  Button,
  notification,
  Radio,
  Icon,
  Divider
} from 'antd';
import * as axios from 'axios';
import { url, CODE_EDITAR } from '../../../utilities/constants';
import { fetchCondominios } from '../../../actions/condominioActions';
import { fetchConstrutoras } from '../../../actions/construtoraActions';
import { fetchClientes } from '../../../actions/clientesActions.js';
import TableClientes from './table';
import ModalAvatar from './avatar';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';
import '../style.css';

const { Content } = Layout;

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class ClientesForm extends React.Component {
  state = {
    enviando: false,
    imagem: null,
    ativo: 1,
    tipo_morador: 1,
    condominios: [],
    tipologias: [],
    clientes: [],
    disabledCond: true,
    disabledTipo: true,
    codTela: null
  };

  onChange = e => {
    this.setState({
      ativo: e.target.value
    });
  };

  tipoChange = e => {
    this.setState({
      tipo_morador: e.target.value
    });
  };

  saveImage = img => {
    this.setState({ imagem: img });
  };

  componentDidMount = () => {
    this.props.form.validateFields();
    this.dispatchCondominios();
    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
  };

  dispatchCondominios = () => {
    this.props.dispatch(fetchCondominios());
    this.props.dispatch(fetchConstrutoras());
    this.props.dispatch(fetchClientes());
  };

  setFieldValue = dados => {
    this.setState({ enviando: true });
    let constru = [];
    let condo = [];
    let unidade = [];

    setTimeout(() => {
      dados.construtoras.map(x => {
        return constru.push(x.id);
      });
      dados.condominios.map(x => {
        return condo.push(x.id);
      });
      dados.unidades.map(x => {
        return unidade.push(x.id);
      });

      this.props.form.setFieldsValue({
        construtoras: constru,
        condominios: condo,
        unidadesAutonomas: unidade
      });
    }, 1500);

    this.props.form.setFieldsValue({
      nome: dados.nome,
      sobrenome: dados.sobrenome,
      username: dados.username,
      email: dados.email,
      telefone: dados.telefone
    });

    this.setState({
      enviando: false,
      imagem: dados.logo,
      ativo: dados.ativo ? 1 : 0,
      tipo_morador: dados.tipo_morador ? 1 : 0,
      editar: true,
      id: dados.id,
      disabledCond: false,
      disabledTipo: false
    });
    this.props.form.validateFields();
  };

  cancelarEdicao = () => {
    this.props.form.resetFields();
    this.setState({
      editar: false,
      imagem: null,
      id: null,
      enviando: false
    });
    this.props.form.validateFields();
  };

  handleUpdate = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
        return;
        this.setState({ enviando: true });
        const config = {
          headers: { Authorization: 'bearer ' + localStorage.getItem('jwt') }
        };
        let c = [];
        let p = [];

        values.condominio.map((x, i) => {
          return c.push({ id: x });
        });

        values.parametrizacao.map((x, i) => {
          return p.push({ id: x });
        });

        axios
          .put(
            `${url}/clientes/${this.state.id}`,
            {
              condominios: [],
              parametrizacao: []
            },
            config
          )
          .then(res => {
            axios
              .put(
                `${url}/clientes/${this.state.id}`,
                {
                  nome: values.nome,
                  email: values.email,
                  celular: values.telefone,
                  logo: this.state.imagem,
                  ativo: this.state.ativo,
                  tipo_morador: this.state.tipo_morador,
                  condominios: c,
                  parametrizacao: p,
                  client: true,
                  funcionario: false,
                  admin: false
                },
                config
              )
              .then(res => {
                notification.open({
                  message: 'Ok',
                  description: 'Cliente editado com sucesso!'
                });
                this.props.form.resetFields();
                this.setState({
                  enviando: false,
                  imagem: null,
                  editar: false,
                  id: null
                });
              })
              .catch(error => {
                notification.open({
                  message: 'Opps!',
                  description: 'Erro ao editar o cliente!'
                });
                this.setState({
                  enviando: false,
                  imagem: null,
                  editar: false,
                  id: null
                });
              });
          });
        this.setState({ enviando: false });
      } else {
        notification.open({
          message: 'Opps',
          description: 'Por favor, preencha todos os campos',
          icon: <Icon type="warning" style={{ color: 'yellow' }} />
        });
        this.setState({ enviando: false });
      }
    });
  };

  handleClientes = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ enviando: true });

        let auth = localStorage.getItem('jwt');
        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };
        axios
          .post(
            `${url}/auth/local/register`,
            {
              username: values.username,
              email: values.email,
              password: values.password,
              nome: values.nome,
              sobrenome: values.sobrenome,
              telefone: values.telefone,
              logo: this.state.imagem,
              ativo: this.state.ativo,
              tipo_morador: this.state.tipo_morador,
              cliente: true,
              funcionario: false,
              admin: false
            },
            config
          )
          .then(res => {
            axios
              .put(
                `${url}/users/${res.data.user.id}`,
                {
                  construtoras: values.construtoras,
                  condominios: values.condominios,
                  unidades: values.unidadesAutonomas
                },
                config
              )
              .then(res => {
                this.props.form.resetFields();
                notification.open({
                  message: 'Ok',
                  description: 'Cliente cadastrado com sucesso!',
                  icon: <Icon type="check" style={{ color: 'green' }} />
                });
                this.props.form.resetFields();
                this.setState({
                  enviando: false,
                  imagem: null,
                  disabledTipo: true,
                  disabledCond: true
                });
              })
              .catch(error => console.log(error));
          })
          .catch(error => {
            notification.open({
              message: 'Opps!',
              description: 'Erro ao cadastrar o cliente!',
              icon: <Icon type="close" style={{ color: 'red' }} />
            });
            this.setState({ enviando: false, imagem: null });
          });
        this.props.form.resetFields();
        this.setState({
          enviando: false,
          disabledCond: false,
          disabledTipo: false
        });
      } else {
        notification.open({
          message: 'Opps',
          description: 'Por favor, preencha todos os campos',
          icon: <Icon type="warning" style={{ color: 'yellow' }} />
        });
        this.setState({
          enviando: false,
          disabledCond: true,
          disabledTipo: true
        });
      }
    });
  };

  phoneMask = e => {
    let x = e.target.value
      .replace(/\D/g, '')
      .match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    e.target.value = !x[2]
      ? x[1]
      : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
  };

  selectInfoCond = id => {
    let c = [];

    id.map((value, i) => {
      let constru = this.props.construtoras.filter(x => x.id === value);
      constru[0].condominios.map((value, i) => {
        return c.push(value);
      });
    });
    this.setState({
      condominios: c,
      disabledCond: false
    });

    // this.props.form.resetFields();
  };

  selectInfoTipo = id => {
    let c = [];
    let auth = localStorage.getItem('jwt');
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    id.map((value, i) => {
      let cond = this.props.condominios.filter(x => x.id === value);
      cond[0].unidadesautonomas.map((value, i) => {
        return c.push(value);
      });
    });

    c.map(unidades => {
      axios
        .get(`${url}/unidadesautonomas/${unidades._id}`, config)
        .then(res => {
          this.setState({
            tipologias: res.data.unidades,
            disabledTipo: false
          });
        })
        .catch(error => console.log(error));
    });
  };

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched
    } = this.props.form;

    const radioStyle = {
      display: 'block',
      height: '10px',
      lineHeight: '10px',
      marginTop: '1rem'
    };

    const construtorasError =
      isFieldTouched('construtoras') && getFieldError('construtoras');
    const condominiosError =
      isFieldTouched('condominios') && getFieldError('condominios');
    const unidadesAutonomasError =
      isFieldTouched('unidadesAutonomas') && getFieldError('unidadesAutonomas');
    const nomeError = isFieldTouched('nome') && getFieldError('nome');
    const sobrenomeError =
      isFieldTouched('sobrenome') && getFieldError('sobrenome');
    const usernameError =
      isFieldTouched('username') && getFieldError('username');
    const passwordError =
      isFieldTouched('password') && getFieldError('password');
    const emailError = isFieldTouched('email') && getFieldError('email');
    const telefoneError =
      isFieldTouched('telefone') && getFieldError('telefone');

    return (
      <Content>
        <div style={{ background: '#fff' }}>
          <Permissao
            codTela={this.state.codTela}
            permissaoNecessaria={CODE_EDITAR}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                borderBottom: '1px solid rgba(0, 0, 0, .1)',
                paddingTop: '5px'
              }}
            >
              <h2>
                <span>Novo Cliente</span>
              </h2>
            </div>
            <Form
              onSubmit={e => {
                this.state.editar
                  ? this.handleUpdate(e)
                  : this.handleClientes(e);
              }}
              style={{ width: '90%', marginTop: '1rem' }}
            >
              <Row gutter={16}>
                <Col span={8} className="centralizado">
                  <ModalAvatar
                    imagem={this.state.imagem}
                    saveImage={this.saveImage}
                  />
                  <RadioGroup onChange={this.onChange} value={this.state.ativo}>
                    <Radio style={radioStyle} value={1}>
                      Ativo
                    </Radio>
                    <Radio style={radioStyle} value={0}>
                      Inativo
                    </Radio>
                  </RadioGroup>
                </Col>
                <Col span={16}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <FormItem
                        validateStatus={nomeError ? 'error' : ''}
                        help={nomeError || ''}
                        label="Nome"
                      >
                        {getFieldDecorator('nome', {
                          rules: [
                            {
                              required: true,
                              message: 'Entre com o nome'
                            }
                          ]
                        })(<Input placeholder="Nome" />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        validateStatus={sobrenomeError ? 'error' : ''}
                        help={sobrenomeError || ''}
                        label="Sobrenome"
                      >
                        {getFieldDecorator('sobrenome', {
                          rules: [
                            {
                              required: true,
                              message: 'Entre com o sobrenome'
                            }
                          ]
                        })(<Input placeholder="Sobrenome" />)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <FormItem
                        validateStatus={usernameError ? 'error' : ''}
                        help={usernameError || ''}
                        label="Usuário"
                      >
                        {getFieldDecorator('username', {
                          rules: [
                            {
                              required: true,
                              message: 'Entre com o usuário'
                            }
                          ]
                        })(<Input placeholder="Usuário" />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        validateStatus={passwordError ? 'error' : ''}
                        help={passwordError || ''}
                        label="Senha"
                      >
                        {getFieldDecorator('password', {
                          rules: [
                            {
                              required: true,
                              message: 'Por favor entre com sua senha!'
                            }
                          ]
                        })(<Input type="password" placeholder="Senha" />)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12} className="esquerda">
                      <FormItem
                        validateStatus={emailError ? 'error' : ''}
                        help={emailError || ''}
                        label="Email"
                      >
                        {getFieldDecorator('email', {
                          rules: [
                            {
                              required: true,
                              message: 'Entre com o e-mail'
                            },
                            {
                              type: 'email',
                              message: 'Formato de e-mail inválido'
                            }
                          ]
                        })(<Input type="email" placeholder="E-mail" />)}
                      </FormItem>
                    </Col>
                    <Col span={12} className="esquerda">
                      <FormItem
                        validateStatus={telefoneError ? 'error' : ''}
                        help={telefoneError || ''}
                        label="Telefone"
                      >
                        {getFieldDecorator('telefone', {
                          rules: [
                            {
                              required: true,
                              message: 'Entre com o telefone'
                            }
                          ]
                        })(
                          <Input
                            placeholder="Telefone"
                            onChange={this.phoneMask}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <FormItem
                        validateStatus={construtorasError ? 'error' : ''}
                        help={construtorasError || ''}
                        label="Escolha a construtora"
                      >
                        {getFieldDecorator('construtoras', {
                          rules: [
                            {
                              required: true,
                              message: 'Escolha a construtora'
                            }
                          ]
                        })(
                          <Select
                            showSearch
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Escolha a construtora"
                            optionFilterProp="children"
                            onChange={this.selectInfoCond}
                            filterOption={(input, option) =>
                              option.props.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {this.props.construtoras.map(
                              (construtora, index) => {
                                return (
                                  <Option
                                    value={construtora._id}
                                    key={construtora.id + index}
                                  >
                                    {construtora.nome}
                                  </Option>
                                );
                              }
                            )}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        validateStatus={condominiosError ? 'error' : ''}
                        help={condominiosError || ''}
                        label={
                          this.state.disabledCond
                            ? 'Escolha a construtora para habilitar esta opção'
                            : 'Escolha o condomínio'
                        }
                      >
                        {getFieldDecorator('condominios', {
                          rules: [
                            {
                              required: true,
                              message: 'Escolha o condomínio'
                            }
                          ]
                        })(
                          <Select
                            showSearch
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder={
                              this.state.disabledCond
                                ? 'Escolha a construtora para habilitar esta opção'
                                : 'Escolha o condomínio'
                            }
                            disabled={this.state.disabledCond}
                            optionFilterProp="children"
                            onChange={this.selectInfoTipo}
                            filterOption={(input, option) =>
                              option.props.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {this.state.condominios.map((condominio, index) => {
                              return (
                                <Option
                                  value={condominio._id}
                                  key={condominio.id + index}
                                >
                                  {condominio.nome}
                                </Option>
                              );
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <FormItem
                        validateStatus={unidadesAutonomasError ? 'error' : ''}
                        help={unidadesAutonomasError || ''}
                        label={
                          this.state.disabledTipo
                            ? 'Escolha o condomínio para habilitar esta opção'
                            : 'Escolha a unidade'
                        }
                      >
                        {getFieldDecorator('unidadesAutonomas', {
                          rules: [
                            {
                              required: true,
                              message: 'Escolha a unidade'
                            }
                          ]
                        })(
                          <Select
                            showSearch
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder={
                              this.state.disabledTipo
                                ? 'Escolha o condomínio para habilitar esta opção'
                                : 'Escolha a unidade'
                            }
                            disabled={this.state.disabledTipo}
                            optionFilterProp="children"
                            onChange={this.handleChange}
                            filterOption={(input, option) =>
                              option.props.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {this.state.tipologias.map((unidade, i) => {
                              return (
                                <Option
                                  value={unidade._id}
                                  key={unidade._id + i}
                                >
                                  {unidade.nome}
                                </Option>
                              );
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12} className="esquerda">
                      <RadioGroup
                        onChange={this.tipoChange}
                        value={this.state.tipo_morador}
                      >
                        <Radio value={1}>Morador</Radio>
                        <Radio value={0}>Síndico</Radio>
                      </RadioGroup>
                    </Col>
                  </Row>
                </Col>
                {this.state.editar && (
                  <Button
                    style={{
                      float: 'right',
                      marginBottom: '2rem',
                      marginLeft: '1rem'
                    }}
                    onClick={this.cancelarEdicao}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ float: 'right', marginBottom: '2rem' }}
                  loading={this.state.enviando}
                  disabled={hasErrors(getFieldsError()) || this.state.enviando}
                >
                  {this.state.editar ? 'Editar' : 'Concluir'}
                </Button>
              </Row>
            </Form>
          </Permissao>
          {/* <Permissao codTela={this.state.codTela} permissaoNecessaria={[1, 2]}>
            <span
              style={{
                color: '#757575',
                fontWeight: 'bold',
                marginLeft: '1rem'
              }}
            >
              Clientes Cadastratos
            </span>
            <Divider />
            <Row>
              <Col span={24}>
                <TableClientes
                  codTela={this.state.codTela}
                  clientes={this.props.clientes}
                  dispatchClientes={this.dispatchCondominios}
                  setFieldValue={this.setFieldValue}
                  resetFields={this.cancelarEdicao}
                />
              </Col>
            </Row>
          </Permissao> */}
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

let Clientes = Form.create()(ClientesForm);
export default (Clientes = connect(store => {
  return {
    condominios: store.condominios.data,
    construtoras: store.construtoras.data,
    clientes: store.clientes.data
  };
})(Clientes));
