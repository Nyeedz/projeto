import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Icon,
  Input,
  Layout,
  Radio,
  Row,
  Select,
  notification,
  Spin,
  message
} from 'antd';
import * as axios from 'axios';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { fetchCondominios } from '../../../actions/condominioActions';
import { fetchConstrutoras } from '../../../actions/construtoraActions';
import { url, CODE_EDITAR } from '../../../utilities/constants';
import ModalAvatar from './avatar';
import TableCondominios from './table';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';
import style from './style.css';
import cep from 'cep-promise'

const { Content } = Layout;
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const styles = {
  centralizado: {
    display: 'inline-flex',
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

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

function onChange(date, dateString) {
  moment(dateString).format('DD/MM/YYYY');
}

class CondominiosForm extends React.Component {
  state = {
    enviando: false,
    imagem: null,
    file: null,
    fileName: '',
    ativo: 1,
    visible: false,
    download: true,
    loading: false,
    contrato: null,
    codTela: null,
    enviandoContrato: false
  };

  componentDidMount = () => {
    this.props.form.validateFields();
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
    this.props.form.validateFields();
    this.dispatchDados();

    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
  };

  dispatchDados = () => {
    this.props.dispatch(fetchCondominios());
    this.props.dispatch(fetchConstrutoras());
  };

  setFieldValue = dados => {
    let auth = localStorage.getItem('jwt') || this.props.user.jwt;
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    axios
      .get(`${url}/condominios/${dados._id}`, config)
      .then(res => {
        this.setState({
          contratoUrl: `${url}${res.data.file.url}`.toString(),
          contrato: res.data.file,
          fileName: res.data.file.name
        });
        this.props.form.setFieldsValue({ contrato: res.data.file });
      })
      .catch(error => {
        console.log(error);
      });

    this.setState({
      imagem: dados.logo,
      ativo: dados.ativo ? 1 : 0,
      editar: true,
      downloadArquivo: true,
      download: true,
      id: dados.id
    });
    this.props.form.setFieldsValue({
      construtoras: dados.construtoras.id,
      nome: dados.nome,
      validade: moment(dados.validade),
      cep: dados.cep,
      bairro: dados.bairro,
      estado: dados.estado,
      cidade: dados.cidade,
      endereco: dados.endereco,
      numero: dados.numero,
      complemento: dados.complemento,
      email: dados.email,
      telefone: dados.telefone
    });
    this.props.form.validateFields();
  };

  cancelarEdicao = () => {
    this.props.form.resetFields();
    this.setState({
      editar: false,
      imagem: false,
      id: null,
      enviando: false,
      file: null,
      download: true,
      fileName: '',
      downloadArquivo: false,
      contrato: null
    });
    this.props.form.validateFields();
  };

  handleUpdate = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ enviando: true, enviandoContrato: true });
        let auth = localStorage.getItem('jwt') || this.props.user.jwt;

        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        axios
          .put(
            `${url}/condominios/${this.state.id}`,
            {
              logo: this.state.imagem,
              construtoras: values.construtoras,
              nome: values.nome,
              ativo: this.state.ativo,
              validade: values.validade,
              cep: values.cep,
              bairro: values.bairro,
              estado: values.estado,
              cidade: values.cidade,
              endereco: values.endereco,
              numero: values.numero,
              complemento: values.complemento,
              email: values.email,
              telefone: values.telefone,
              deleted: false
            },
            config
          )
          .then(res => {
            let contrato = new FormData();
            contrato.append('ref', 'condominios');
            contrato.append('refId', res.data.id);
            contrato.append('field', 'file');
            contrato.append('files', this.state.file);

            axios
              .post(`${url}/upload`, contrato, config)
              .then(res => {
                this.props.dispatch(
                  fetchCondominios({
                    logo: this.state.imagem,
                    construtoras: values.construtoras,
                    nome: values.nome,
                    ativo: this.state.ativo,
                    validade: values.validade,
                    cep: values.cep,
                    bairro: values.bairro,
                    estado: values.estado,
                    cidade: values.cidade,
                    contrato: contrato,
                    endereco: values.endereco,
                    numero: values.numero,
                    complemento: values.complemento,
                    email: values.email,
                    telefone: values.telefone,
                    deleted: false
                  })
                );
                this.dispatchDados();
                notification.open({
                  message: 'Ok',
                  description: 'Condomínio cadastrado com sucesso!',
                  icon: <Icon type="check" style={{ color: 'green' }} />
                });
                this.props.form.resetFields();
                this.setState({
                  enviando: false,
                  imagem: null,
                  editar: false,
                  id: null,
                  download: true,
                  enviandoContrato: false
                });
              })
              .catch(error => {
                console.log(error);
                notification.open({
                  message: 'Oppss!',
                  description: 'Erro ao enviar o contrato',
                  icon: <Icon type="check" style={{ color: 'red' }} />
                });
              });
          })
          .catch(error => {
            notification.open({
              message: 'Opps!',
              description: 'Erro ao cadastrar o condomínio!',
              icon: <Icon type="check" style={{ color: 'red' }} />
            });
            this.setState({
              enviando: false,
              imagem: null,
              editar: true,
              id: null,
              enviandoContrato: false
            });
          });

        this.setState({
          enviando: false,
          imagem: null,
          editar: true,
          id: null,
          enviandoContrato: false
        });
      } else {
        notification.open({
          message: 'Opps',
          description: 'Por favor, preencha todos os campos',
          icon: <Icon type="warning" style={{ color: 'yellow' }} />
        });
        this.setState({ enviando: false, enviandoContrato: false });
      }
    });
  };

  handleCondominios = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ enviando: true, enviandoContrato: true });
        let auth = localStorage.getItem('jwt') || this.props.user.jwt;

        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        axios
          .post(
            `${url}/condominios`,
            {
              logo: this.state.imagem,
              construtoras: values.construtoras,
              nome: values.nome,
              ativo: this.state.ativo,
              validade: values.validade,
              cep: values.cep,
              bairro: values.bairro,
              estado: values.estado,
              cidade: values.cidade,
              endereco: values.endereco,
              numero: values.numero,
              complemento: values.complemento,
              email: values.email,
              telefone: values.telefone,
              deleted: false
            },
            config
          )
          .then(res => {
            let contrato = new FormData();
            contrato.append('ref', 'condominios');
            contrato.append('refId', res.data.id);
            contrato.append('field', 'file');
            contrato.append('files', this.state.file);

            axios
              .post(`${url}/upload`, contrato, config)
              .then(res => {
                this.props.dispatch(
                  fetchCondominios({
                    logo: this.state.imagem,
                    construtoras: values.construtoras,
                    nome: values.nome,
                    ativo: this.state.ativo,
                    validade: values.validade,
                    cep: values.cep,
                    bairro: values.bairro,
                    estado: values.estado,
                    cidade: values.cidade,
                    endereco: values.endereco,
                    contrato: contrato,
                    numero: values.numero,
                    complemento: values.complemento,
                    email: values.email,
                    telefone: values.telefone,
                    deleted: false
                  })
                );
                this.dispatchDados();
                notification.open({
                  message: 'Ok',
                  description: 'Condomínio cadastrado com sucesso!',
                  icon: <Icon type="check" style={{ color: 'green' }} />
                });
                this.props.form.resetFields();
                this.setState({
                  enviando: false,
                  imagem: null,
                  fileName: 'Selecione o contrato',
                  download: true,
                  enviandoContrato: false
                });
              })
              .catch(error => {
                console.log(error);
                notification.open({
                  message: 'Oppss!',
                  description: 'Erro ao enviar o contrato',
                  icon: <Icon type="check" style={{ color: 'red' }} />
                });
              });
          })
          .catch(error => {
            notification.open({
              message: 'Opps!',
              description: 'Erro ao cadastrar o condomínio!',
              icon: <Icon type="check" style={{ color: 'red' }} />
            });
            this.setState({
              enviando: false,
              imagem: null,
              fileName: 'Selecione o contrato'
            });
          });

        this.setState({
          enviando: false
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

  phoneMask = e => {
    let x = e.target.value
      .replace(/\D/g, '')
      .match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    e.target.value = !x[2]
      ? x[1]
      : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
  };

  getAddress = e => {
    if (e.target.value.toString().length > 7) {
      this.setState({ enviando: true });
      cep(e.target.value).then(
        res => {
          this.props.form.setFieldsValue({
            cep: res.cep,
            cidade: res.city,
            endereco: res.street,
            bairro: res.neighborhood,
            complemento: res.complemento,
            estado: res.state
          });
          this.setState({ enviando: false });
        },
        error => {
          message.error('Erro ao buscar o cep !');
          this.setState({ enviando: false });
        }
      );
    }
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
    const nomeError = isFieldTouched('nome') && getFieldError('nome');
    const ContratoError =
      isFieldTouched('contrato') && getFieldError('contrato');
    const validadeError =
      isFieldTouched('validade') && getFieldError('validade');
    const cepError = isFieldTouched('cep') && getFieldError('cep');
    const bairroError = isFieldTouched('bairro') && getFieldError('bairro');
    const estadoError = isFieldTouched('estado') && getFieldError('estado');
    const cidadeError = isFieldTouched('cidade') && getFieldError('cidade');
    const enderecoError =
      isFieldTouched('endereco') && getFieldError('endereco');
    const numeroError = isFieldTouched('numero') && getFieldError('numero');
    const complementoError =
      isFieldTouched('complemento') && getFieldError('complemento');
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
                padding: 5
              }}
            >
              <h2>
                <span>Novo Condominio</span>
              </h2>
            </div>
            <Form
              onSubmit={e => {
                this.state.editar
                  ? this.handleUpdate(e)
                  : this.handleCondominios(e);
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
                    <Col span={4} />
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Spin spinning={this.state.enviando}>
                        <FormItem
                          validateStatus={construtorasError ? 'error' : ''}
                          help={construtorasError || ''}
                          label="Escolha a construtora"
                        >
                          {getFieldDecorator('construtoras')(
                            <Select
                              showSearch
                              //mode="tags"
                              style={{ width: '350px' }}
                              placeholder="Escolha a construtora"
                              optionFilterProp="children"
                              onChange={this.handleChange}
                              filterOption={(input, option) =>
                                option.props.children
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {this.props.construtoras.map(
                                (construtoras, index) => {
                                  return (
                                    <Option value={construtoras.id} key={index}>
                                      {construtoras.nome}
                                    </Option>
                                  );
                                }
                              )}
                            </Select>
                          )}
                        </FormItem>
                      </Spin>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Spin spinning={this.state.enviando}>
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
                      </Spin>
                    </Col>
                  </Row>
                  <Row
                    gutter={16}
                    type="flex"
                    justify="space-around"
                    align="middle"
                  >
                    <Col span={12}>
                      <Spin spinning={this.state.enviandoContrato}>
                        <FormItem
                          validateStatus={ContratoError ? 'error' : ''}
                          help={ContratoError || ''}
                          label="Contrato"
                          style={{ marginTop: '1.5rem' }}
                        >
                          {getFieldDecorator('contrato', {
                            rules: [
                              {
                                required: true,
                                message: 'Entre com o contrato'
                              }
                            ]
                          })(
                            <div>
                              <Button
                                onClick={e => this.upload.click()}
                                style={{ width: '95%' }}
                              >
                                <Icon type="upload" />
                                {this.state.fileName === ''
                                  ? 'Selecione o contrato'
                                  : this.state.fileName}
                              </Button>
                              <input
                                type="file"
                                hidden={this.state.download}
                                accept="*"
                                ref={ref => (this.upload = ref)}
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
                        <FormItem />
                      </Spin>
                    </Col>
                    <Col span={12}>
                      <Spin spinning={this.state.enviando}>
                        <FormItem
                          validateStatus={validadeError ? 'error' : ''}
                          help={validadeError || ''}
                          label="Validade"
                        >
                          {getFieldDecorator('validade', {
                            rules: [
                              {
                                required: true,
                                message: 'Entre com a validade'
                              }
                            ]
                          })(
                            <DatePicker
                              onChange={onChange}
                              placeholder="Validade"
                              format="DD/MM/YYYY"
                              style={{ width: '100%' }}
                            />
                          )}
                        </FormItem>
                      </Spin>
                    </Col>
                  </Row>
                  {this.state.downloadArquivo &&
                  this.state.contrato !== null ? (
                    <Row gutter={16}>
                      <Col span={4} />
                      <Col span={12}>
                        <Spin spinning={this.state.enviandoContrato}>
                          <FormItem>
                            <a href={this.state.contratoUrl} target="_blank">
                              Baixar Contrato
                            </a>
                          </FormItem>
                        </Spin>
                      </Col>
                    </Row>
                  ) : null}
                  <Row gutter={16}>
                    <Col span={8} style={styles.esquerda}>
                      <Spin
                        spinning={this.state.loading || this.state.enviando}
                      >
                        <FormItem
                          validateStatus={cepError ? 'error' : ''}
                          help={cepError || ''}
                          label="Cep"
                        >
                          {getFieldDecorator('cep', {
                            rules: [
                              {
                                required: true,
                                message: 'Entre com o cep'
                              }
                            ]
                          })(
                            <Input
                              placeholder="Cep"
                              onChange={this.getAddress}
                            />
                          )}
                        </FormItem>
                      </Spin>
                    </Col>
                    <Col span={12} style={styles.esquerda}>
                      <Spin
                        spinning={this.state.loading || this.state.enviando}
                      >
                        <FormItem
                          validateStatus={cidadeError ? 'error' : ''}
                          help={cidadeError || ''}
                          label="Cidade"
                        >
                          {getFieldDecorator('cidade', {
                            rules: [
                              {
                                required: true,
                                message: 'Entre com o cidade'
                              }
                            ]
                          })(<Input placeholder="Cidade" />)}
                        </FormItem>
                      </Spin>
                    </Col>
                    <Col span={4} style={styles.esquerda}>
                      <Spin
                        spinning={this.state.loading || this.state.enviando}
                      >
                        <FormItem
                          validateStatus={estadoError ? 'error' : ''}
                          help={estadoError || ''}
                          label="Estado"
                        >
                          {getFieldDecorator('estado', {
                            rules: [
                              {
                                required: true,
                                message: 'Entre com o estado'
                              }
                            ]
                          })(<Input placeholder="Estado" />)}
                        </FormItem>
                      </Spin>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={7} style={styles.esquerda}>
                      <Spin
                        spinning={this.state.loading || this.state.enviando}
                      >
                        <FormItem
                          validateStatus={enderecoError ? 'error' : ''}
                          help={enderecoError || ''}
                          label="Endereço"
                        >
                          {getFieldDecorator('endereco', {
                            rules: [
                              {
                                required: true,
                                message: 'Entre com o endereço'
                              }
                            ]
                          })(<Input placeholder="Endereço" />)}
                        </FormItem>
                      </Spin>
                    </Col>
                    <Col span={4} style={styles.esquerda}>
                      <Spin spinning={this.state.enviando}>
                        <FormItem
                          validateStatus={numeroError ? 'error' : ''}
                          help={numeroError || ''}
                          label="Número"
                        >
                          {getFieldDecorator('numero', {
                            rules: [
                              {
                                required: true,
                                message: 'Entre com o numero'
                              }
                            ]
                          })(<Input type="number" placeholder="Número" />)}
                        </FormItem>
                      </Spin>
                    </Col>
                    <Col span={7} style={styles.esquerda}>
                      <Spin
                        spinning={this.state.loading || this.state.enviando}
                      >
                        <FormItem
                          validateStatus={bairroError ? 'error' : ''}
                          help={bairroError || ''}
                          label="Bairro"
                        >
                          {getFieldDecorator('bairro', {
                            rules: [
                              {
                                required: true,
                                message: 'Entre com o bairro'
                              }
                            ]
                          })(<Input placeholder="Bairro" />)}
                        </FormItem>
                      </Spin>
                    </Col>

                    <Col span={6} style={styles.esquerda}>
                      <Spin
                        spinning={this.state.loading || this.state.enviando}
                      >
                        <FormItem
                          validateStatus={complementoError ? 'error' : ''}
                          help={complementoError || ''}
                          label="Complemento"
                        >
                          {getFieldDecorator('complemento', {
                            rules: [
                              {
                                required: false
                              }
                            ]
                          })(<Input placeholder="Complemento" />)}
                        </FormItem>
                      </Spin>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12} style={styles.esquerda}>
                      <Spin spinning={this.state.enviando}>
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
                                message: 'Entre com email valido!'
                              }
                            ]
                          })(<Input type="email" placeholder="E-mail" />)}
                        </FormItem>
                      </Spin>
                    </Col>
                    <Col span={12} style={styles.esquerda}>
                      <Spin spinning={this.state.enviando}>
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
                      </Spin>
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

          <Permissao codTela={this.state.codTela} permissaoNecessaria={[1, 2]}>
            <span
              style={{
                color: '#757575',
                fontWeight: 'bold',
                marginLeft: '1rem'
              }}
            >
              Condomínios cadastrados
            </span>
            <Divider />
            <Row>
              <Col span={24}>
                <TableCondominios
                  codTela={this.state.codTela}
                  condominios={this.props.condominios}
                  dispatchDados={this.dispatchDados}
                  setFieldValue={this.setFieldValue}
                  resetFields={this.cancelarEdicao}
                />
              </Col>
            </Row>
          </Permissao>
        </div>
      </Content>
    );
  }
}

let Condominios = Form.create()(CondominiosForm);
export default (Condominios = connect(store => {
  return {
    condominios: store.condominios.data,
    construtoras: store.construtoras.data,
    user: store.user
  };
})(Condominios));
