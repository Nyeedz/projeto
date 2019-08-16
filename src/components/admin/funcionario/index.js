import React from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Layout,
  Form,
  Input,
  Spin,
  Select,
  Button,
  notification,
  Radio,
  Icon,
  Divider
} from 'antd';
import * as axios from 'axios';
import { url, funcionarioId } from '../../../utilities/constants';
import { fetchCondominios } from '../../../actions/condominioActions';
import { fetchConstrutoras } from '../../../actions/construtoraActions';
import { fetchFuncionarios } from '../../../actions/funcionariosActions';
import TableFuncionarios from './table';
import ModalAvatar from './avatar';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';

const { Content } = Layout;
const ButtonGroup = Button.Group;

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
const RadioGroup = Radio.Group;
const Option = Select.Option;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class FuncionarioForm extends React.Component {
  state = {
    enviando: false,
    imagem: null,
    ativo: 1,
    condominios: [],
    file: '',
    fileName: '',
    visible: false,
    download: true,
    assinatura: null,
    disabledCond: true,
    disabledTipo: true,
    statusPermissoes: [
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 }
    ],
    codTela: null,
    downloadArquivo: false
  };

  onChangePermissoes = (event, id) => {
    this.setState({
      statusPermissoes: this.state.statusPermissoes.map((permissao, index) => {
        if (index === id) {
          return {
            status: event.target.value
          };
        }
        return permissao;
      })
    });
  };

  onChange = e => {
    this.setState({
      ativo: e.target.value
    });
  };

  saveImage = img => {
    this.setState({ imagem: img });
  };

  handleFile = e => {
    this.setState({
      file: e.target.files[0],
      fileName: e.target.files[0].name,
      vibible: true
    });
  };

  componentDidMount = () => {
    this.dispatchCondominios();
    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
  };

  dispatchCondominios = () => {
    this.props.dispatch(fetchCondominios());
    this.props.dispatch(fetchConstrutoras());
    this.props.dispatch(fetchFuncionarios());
  };

  setFieldValue = dados => {
    this.setState({ loading: true });

    const construtoras = dados.construtoras.map(construtora => {
      return construtora._id;
    });

    const condominios = dados.condominios.map(condominio => {
      return condominio._id;
    });

    this.selectInfoCond(construtoras);

    this.props.form.setFieldsValue({ construtoras });
    this.props.form.setFieldsValue({ condominios });

    this.props.form.setFieldsValue({
      username: dados.username,
      email: dados.email,
      nome: dados.nome,
      sobrenome: dados.sobrenome,
      telefone: dados.telefone,
      funcao: dados.funcao
    });

    this.setState({
      imagem: dados.logo,
      ativo: dados.ativo ? 1 : 0,
      editar: true,
      id: dados._id,
      assinatura: dados.file,
      downloadArquivo: true,
      statusPermissoes: dados.permissoes
    });
    if (dados.file === null) {
      this.setState({ fileName: 'Assinatura digital' });
    } else {
      this.setState({ fileName: dados.file.name, file: null });
    }

    // this.props.form.validateFields();
  };

  cancelarEdicao = () => {
    this.props.form.resetFields();
    this.setState({
      editar: false,
      imagem: false,
      id: null,
      enviando: false,
      file: '',
      download: true,
      fileName: '',
      downloadArquivo: false,
      assinatura: null
    });
  };

  handleUpdate = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log(err);
      if (!err) {
        this.setState({ enviando: true });
        const config = {
          headers: { Authorization: 'bearer ' + localStorage.getItem('jwt') }
        };

        const construtoras = values.construtoras.map((id, i) => {
          return id;
        });

        const condominios = values.condominios.map((id, i) => {
          return id;
        });

        axios
          .put(
            `${url}/users/${this.state.id}`,
            {
              logo: this.state.imagem,
              construtoras,
              condominios,
              username: values.username,
              email: values.email,
              nome: values.nome,
              ativo: this.state.ativo,
              sobrenome: values.sobrenome,
              telefone: values.telefone,
              funcao: values.funcao,
              telefone: values.telefone,
              permissoes: this.state.statusPermissoes
            },
            config
          )
          .then(res => {
            if (this.state.file === null) {
              this.dispatchCondominios();
              notification.open({
                message: 'Ok',
                description: 'Funcionário editado com sucesso!',
                icon: <Icon type="check" style={{ color: 'green' }} />
              });

              this.props.form.resetFields();

              this.setState({
                enviando: false,
                imagem: null,
                file: '',
                editar: false,
                fileName: 'Assinatura Digital',
                id: null,
                download: true,
                downloadArquivo: false
              });
              return false;
            } else {
              let contrato = new FormData();
              contrato.append('ref', 'user');
              contrato.append('refId', res.data._id);
              contrato.append('field', 'file');
              contrato.append('source', 'users-permissions');
              contrato.append('file', this.state.file);

              axios
                .post(`${url}/upload`, contrato, config)
                .then(() => {
                  this.dispatchCondominios();
                  notification.open({
                    message: 'Ok',
                    description: 'Funcionário editado com sucesso!',
                    icon: <Icon type="check" style={{ color: 'green' }} />
                  });
                  this.props.form.resetFields();
                  this.setState({
                    enviando: false,
                    imagem: null,
                    editar: false,
                    id: null,
                    file: '',
                    download: true,
                    fileName: '',
                    downloadArquivo: false,
                    assinatura: null
                  });
                })
                .catch(error => console.log(error));
            }
          });
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
              ativo: this.state.ativo,
              sobrenome: values.sobrenome,
              telefone: values.telefone,
              funcao: values.funcao,
              logo: this.state.imagem,
              funcionario: true
            },
            config
          )
          .then(res => {
            axios
              .put(
                `${url}/users/${res.data.user.id}`,
                {
                  assinatura: res.data.user.id,
                  role: {
                    _id: funcionarioId
                  },
                  condominios: values.condominios,
                  construtoras: values.construtoras,
                  permissoes: this.state.statusPermissoes
                },
                config
              )
              .then(res => {
                if (this.state.file) {
                  let contrato = new FormData();
                  contrato.append('ref', 'user');
                  contrato.append('refId', res.data._id);
                  contrato.append('field', 'file');
                  contrato.append('source', 'users-permissions');
                  contrato.append('files', this.state.file);

                  axios
                    .post(`${url}/upload`, contrato, config)
                    .then(() => {
                      this.props.dispatch(fetchFuncionarios());
                      this.setState({
                        file: '',
                        download: true,
                        fileName: '',
                        downloadArquivo: false,
                        assinatura: null
                      });
                    })
                    .catch(error => console.log(error));
                }
                this.props.dispatch(fetchFuncionarios());
              })
              .catch(error => console.log(error));

            notification.open({
              message: 'Ok',
              description: 'Cliente cadastrado com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.props.form.resetFields();
            this.setState({
              enviando: false,
              imagem: null,
              statusPermissoes: [
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 }
              ],
              downloadArquivo: false
            });
          })
          .catch(error => {
            notification.open({
              message: 'Opps!',
              description: error.message,
              icon: <Icon type="close" style={{ color: 'red' }} />
            });
            this.setState({
              enviando: false,
              imagem: null,
              file: '',
              download: true,
              fileName: '',
              downloadArquivo: false,
              assinatura: null,
              statusPermissoes: [
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 },
                { status: 0 }
              ]
            });
          });
      } else {
        notification.open({
          message: 'Ops',
          description: 'Por favor, preencha todos os campos',
          icon: <Icon type="warning" style={{ color: 'yellow' }} />
        });
        this.setState({ enviando: false, downloadArquivo: false });
      }
      this.props.dispatch(fetchFuncionarios());
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
  };

  changeAll = val => {
    const newPerm = [
      { status: val },
      { status: val },
      { status: val },
      { status: val },
      { status: val },
      { status: val },
      { status: val },
      { status: val },
      { status: val },
      { status: val },
      { status: val },
      { status: val }
    ];

    this.setState({ statusPermissoes: newPerm });
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
    const nomeError = isFieldTouched('nome') && getFieldError('nome');
    const sobrenomeError =
      isFieldTouched('sobrenome') && getFieldError('sobrenome');
    const funcaoError = isFieldTouched('funcao') && getFieldError('funcao');
    const assinaturaError =
      isFieldTouched('assinatura') && getFieldError('assinatura');
    const usernameError =
      isFieldTouched('username') && getFieldError('username');
    const passwordError =
      isFieldTouched('password') && getFieldError('password');
    const emailError = isFieldTouched('email') && getFieldError('email');
    const telefoneError =
      isFieldTouched('telefone') && getFieldError('telefone');

    const telas = [
      {
        id: 0,
        nome: 'Construtoras'
      },
      {
        id: 1,
        nome: 'Condomínios'
      },
      {
        id: 2,
        nome: 'Tipologia'
      },
      {
        id: 3,
        nome: 'Unidades autônomas'
      },
      {
        id: 4,
        nome: 'Área comum geral'
      },
      {
        id: 5,
        nome: 'Área comum da tipologia'
      },
      {
        id: 6,
        nome: 'Visualizar Parametrizacao'
      },
      {
        id: 7,
        nome: 'Itens de garantia'
      },
      {
        id: 8,
        nome: 'Pesquisa de satisfação'
      },
      {
        id: 9,
        nome: 'Clientes'
      },
      {
        id: 10,
        nome: 'Chamados'
      },
      {
        id: 11,
        nome: 'Funcionarios'
      }
    ];

    return (
      <Content>
        <div style={{ background: '#fff' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, .1)',
              padding: 5
            }}
          >
            <h2>
              <span>Novo funcionário</span>
            </h2>
          </div>
          <Spin spinning={this.state.enviando}>
            <Form
              onSubmit={e => {
                this.state.editar
                  ? this.handleUpdate(e)
                  : this.handleClientes(e);
              }}
              style={{ width: '90%' }}
            >
              <Row gutter={16} style={{ marginTop: '1rem' }}>
                <Col span={8} style={styles.centralizado}>
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
                        validateStatus={funcaoError ? 'error' : ''}
                        help={funcaoError || ''}
                      >
                        {getFieldDecorator('funcao', {
                          rules: [
                            {
                              required: true,
                              message: 'Entre a função'
                            }
                          ]
                        })(<Input placeholder="Função" />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        validateStatus={assinaturaError ? 'error' : ''}
                        help={assinaturaError || ''}
                      >
                        {getFieldDecorator('assinatura')(
                          <div>
                            <Button
                              onClick={e => this.upload.click()}
                              style={{ width: '95%' }}
                            >
                              <Icon type="upload" />
                              {this.state.fileName === ''
                                ? 'Assinatura digital'
                                : this.state.fileName}
                              <br />
                              {this.state.downloadArquivo &&
                              this.state.assinatura !== null ? (
                                <a
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginTop: '1rem'
                                  }}
                                  href={`${url}${this.state.assinatura.url.toString()}`}
                                  target="_blank"
                                >
                                  Baixar Assinatura
                                </a>
                              ) : null}
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              ref={ref => (this.upload = ref)}
                              hidden={this.state.download}
                              onChange={this.handleFile}
                            />
                            <br />
                            <span
                              hidden={this.state.visible}
                              style={{
                                display: 'flex',
                                justifyContent: 'center'
                              }}
                            />
                          </div>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <FormItem
                        validateStatus={usernameError ? 'error' : ''}
                        help={usernameError || ''}
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
                      >
                        {getFieldDecorator('password', {
                          rules: [
                            {
                              required: !this.state.editar,
                              message: 'Por favor entre com sua senha!'
                            }
                          ]
                        })(
                          <Input.Password type="password" placeholder="Senha" />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12} style={styles.esquerda}>
                      <FormItem
                        validateStatus={emailError ? 'error' : ''}
                        help={emailError || ''}
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
                    <Col span={12} style={styles.esquerda}>
                      <FormItem
                        validateStatus={telefoneError ? 'error' : ''}
                        help={telefoneError || ''}
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
                                    value={construtora.id}
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
                      >
                        {getFieldDecorator('condominios', {
                          rules: [
                            {
                              required: true,
                              message: 'Escolha os condomínios'
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
                                : 'Escolha os condomínios'
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
                                  value={condominio.id}
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
                  <Row style={{ marginTop: '1rem' }}>
                    <Col span={10}>
                      <FormItem>
                        <span
                          style={{
                            color: '#757575',
                            fontWeight: 'bold',
                            marginTop: '2rem'
                          }}
                        >
                          Selecionar permissões
                        </span>
                      </FormItem>
                    </Col>
                    <Col span={14}>
                      <ButtonGroup>
                        <Button
                          onClick={() => this.changeAll(0)}
                          type="primary"
                        >
                          Nenhuma
                        </Button>
                        <Button
                          onClick={() => this.changeAll(1)}
                          type="primary"
                        >
                          Visualizar
                        </Button>
                        <Button
                          onClick={() => this.changeAll(2)}
                          type="primary"
                        >
                          Editar
                        </Button>
                      </ButtonGroup>
                    </Col>
                  </Row>

                  {telas.map((tela, i) => {
                    return (
                      <div key={`tela-${tela.id + i}`}>
                        <Row>
                          <Col span={10}>
                            {tela.nome}
                            <Divider />
                          </Col>
                          <Col span={14}>
                            <RadioGroup
                              onChange={event => {
                                this.onChangePermissoes(event, tela.id);
                              }}
                              value={
                                this.state.statusPermissoes[tela.id].status
                              }
                            >
                              <Radio value={0}>Nenhuma</Radio>
                              <Radio value={1}>Visualizar</Radio>
                              <Radio value={2}>Editar</Radio>
                            </RadioGroup>
                            <Divider />
                          </Col>
                        </Row>
                      </div>
                    );
                  })}
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
          </Spin>
          <Permissao codTela={this.state.codTela} permissaoNecessaria={[1, 2]}>
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
                <TableFuncionarios
                  codTela={this.state.codTela}
                  funcionarios={this.props.funcionarios}
                  dispatchFuncionarios={this.dispatchCondominios}
                  setFieldValue={this.setFieldValue}
                  resetFields={this.cancelarEdicao}
                />
              </Col>
            </Row>
          </Permissao>
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

let Funcionario = Form.create()(FuncionarioForm);
export default (Funcionario = connect(store => {
  return {
    condominios: store.condominios.data,
    construtoras: store.construtoras.data,
    user: store.user,
    funcionarios: store.funcionarios.data
  };
})(Funcionario));
