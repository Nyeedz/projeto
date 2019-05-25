import React from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Layout,
  Form,
  Input,
  Button,
  notification,
  Divider,
  Radio,
  Icon,
  Spin,
  message
} from 'antd';
import * as axios from 'axios';
import { url, CODE_EDITAR } from '../../../utilities/constants';
import { fetchConstrutoras } from '../../../actions/construtoraActions';
import TableConstrutoras from './table';
import ModalAvatar from './avatar';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';
import cep from 'cep-promise';
import '../style.css';

const { Content } = Layout;

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class ConstrutoraForm extends React.Component {
  state = {
    enviando: false,
    imagem: null,
    ativo: 1,
    codTela: null
  };

  onChange = e => {
    this.setState({
      ativo: e.target.value
    });
  };

  saveImage = img => {
    this.setState({ imagem: img });
  };

  componentDidMount = () => {
    this.dispatchConstrutoras();
    this.props.form.validateFields();

    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
  };

  dispatchConstrutoras = () => {
    this.props.dispatch(fetchConstrutoras());
  };

  setFieldValue = dados => {
    this.setState({ enviando: true });
    this.props.form.setFieldsValue({
      nome: dados.nome,
      razao_social: dados.razao_social,
      cnpj: dados.cnpj,
      cep: dados.cep,
      estado: dados.estado,
      cidade: dados.cidade,
      endereco: dados.endereco,
      bairro: dados.bairro,
      numero: dados.numero,
      complemento: dados.complemento || '',
      email: dados.email,
      telefone: dados.telefone
    });
    this.setState({
      imagem: dados.logo,
      ativo: dados.ativo ? 1 : 0,
      editar: true,
      id: dados.id,
      enviando: false
    });
    this.props.form.validateFields();
  };

  cancelarEdicao = () => {
    this.props.form.resetFields();
    this.setState({
      editar: false,
      imagem: false,
      id: null
    });
    this.props.form.validateFields();
  };

  handleUpdate = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ enviando: true });
        let auth = localStorage.getItem('jwt') || this.props.user.jwt;

        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };
        axios
          .put(
            `${url}/construtoras/${this.state.id}`,
            {
              logo: this.state.imagem,
              nome: values.nome,
              ativo: this.state.ativo,
              razao_social: values.razao_social,
              cnpj: values.cnpj,
              cep: values.cep,
              estado: values.estado,
              cidade: values.cidade,
              endereco: values.endereco,
              bairro: values.bairro,
              numero: values.numero,
              complemento: values.complemento,
              email: values.email,
              telefone: values.telefone
            },
            config
          )
          .then(res => {
            this.props.dispatch(
              fetchConstrutoras({
                logo: this.state.imagem,
                nome: values.nome,
                ativo: this.state.ativo,
                razao_social: values.razao_social,
                cnpj: values.cnpj,
                cep: values.cep,
                estado: values.estado,
                cidade: values.cidade,
                endereco: values.endereco,
                bairro: values.bairro,
                numero: values.numero,
                complemento: values.complemento,
                email: values.email,
                telefone: values.telefone
              })
            );
            notification.open({
              message: 'Ok',
              description: 'Construtora editada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.props.form.resetFields();
            this.props.form.validateFields();
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
              description: 'Erro ao editar construtora!',
              icon: <Icon type="check" style={{ color: 'red' }} />
            });
            this.setState({
              enviando: false,
              imagem: null,
              editar: false,
              id: null
            });
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

  handleConstrutora = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ enviando: true });
        let auth = localStorage.getItem('jwt') || this.props.user.jwt;

        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };
        axios
          .post(
            `${url}/construtoras`,
            {
              nome: values.nome,
              logo: this.state.imagem,
              razao_social: values.razao_social,
              cnpj: values.cnpj,
              cep: values.cep,
              estado: values.estado,
              endereco: values.endereco,
              bairro: values.bairro,
              complemento: values.complemento,
              cidade: values.cidade,
              telefone: values.telefone,
              ativo: this.state.ativo,
              numero: values.numero,
              email: values.email
            },
            config
          )
          .then(res => {
            this.props.dispatch(fetchConstrutoras());
            notification.open({
              message: 'Ok',
              description: 'Construtora cadastrada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.props.form.resetFields();
            this.props.form.validateFields();
            this.setState({ enviando: false, imagem: null });
          })
          .catch(error => {
            notification.open({
              message: 'Opps!',
              description: 'Erro ao cadastrar construtora!',
              icon: <Icon type="check" style={{ color: 'red' }} />
            });
            this.setState({ enviando: false, imagem: null });
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

  phoneMask = e => {
    let x = e.target.value
      .replace(/\D/g, '')
      .match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    e.target.value = !x[2]
      ? x[1]
      : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
  };

  cnpjMask = e => {
    let cnpj = e.target.value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?/, '$1 $2 $3/$4-$5');

    if (
      e.target.value == '00 000 000/0000-00' ||
      e.target.value == '11 111 111/1111-11' ||
      e.target.value == '22 222 222/2222-22' ||
      e.target.value == '33 333 333/3333-33' ||
      e.target.value == '44 444 444/4444-44' ||
      e.target.value == '55 555 555/5555-55' ||
      e.target.value == '66 666 666/6666-66' ||
      e.target.value == '77 777 777/7777-77' ||
      e.target.value == '88 888 888/8888-88' ||
      e.target.value == '99 999 999/9999-99'
    )
      return message.error('Cnpj inválido');

    e.target.value = cnpj;
  };

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched
    } = this.props.form;

    const nomeError = isFieldTouched('nome') && getFieldError('nome');
    const razaoError =
      isFieldTouched('razao_social') && getFieldError('razao_social');
    const cnpjError = isFieldTouched('cnpj') && getFieldError('cnpj');
    const cepError = isFieldTouched('cep') && getFieldError('cep');
    const estadoError = isFieldTouched('estado') && getFieldError('estado');
    const cidadeError = isFieldTouched('cidade') && getFieldError('cidade');
    const bairroError = isFieldTouched('bairro') && getFieldError('bairro');
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
            <div className="main-title">
              <h2>
                <span>Nova Construtora</span>
              </h2>
            </div>
            <Spin spinning={this.state.enviando}>
              <Form
                onSubmit={e => {
                  this.state.editar
                    ? this.handleUpdate(e)
                    : this.handleConstrutora(e);
                }}
                style={{ width: '90%' }}
              >
                <Row gutter={16} style={{ marginTop: '1rem' }}>
                  <Col span={8} className="centralizado">
                    <ModalAvatar
                      imagem={this.state.imagem}
                      saveImage={this.saveImage}
                    />
                    <RadioGroup
                      onChange={this.onChange}
                      value={this.state.ativo}
                    >
                      <Radio className="radio" value={1}>
                        Ativo
                      </Radio>
                      <Radio className="radio" value={0}>
                        Inativo
                      </Radio>
                    </RadioGroup>
                  </Col>
                  <Col span={16}>
                    <Row>
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
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <FormItem
                          validateStatus={razaoError ? 'error' : ''}
                          help={razaoError || ''}
                          label="Razão Social"
                        >
                          {getFieldDecorator('razao_social', {
                            rules: [
                              {
                                required: true,
                                message: 'Entre com a razão social'
                              }
                            ]
                          })(<Input placeholder="Razão Social" />)}
                        </FormItem>
                      </Col>
                      <Col span={12} className="esquerda">
                        <FormItem
                          validateStatus={cnpjError ? 'error' : ''}
                          help={cnpjError || ''}
                          label="Cnpj"
                        >
                          {getFieldDecorator('cnpj', {
                            rules: [
                              {
                                required: true,
                                message: 'Entre com o Cnpj'
                              }
                            ]
                          })(
                            <Input
                              placeholder="Cnpj"
                              onChange={this.cnpjMask}
                              maxLength={18}
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8} className="esquerda">
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
                      <Col span={12} className="esquerda">
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
                      <Col span={4} className="esquerda">
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
                      <Col span={7} className="esquerda">
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
                      <Col span={4} className="esquerda">
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
                      <Col span={7} className="esquerda">
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

                      <Col span={6} className="esquerda">
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
                                message: 'formato de e-mail invalido!'
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
                  </Col>
                  {this.state.editar && (
                    <Button
                      className="cancel-button"
                      onClick={this.cancelarEdicao}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={this.state.enviando}
                    className="cadastrar-button"
                    disabled={
                      hasErrors(getFieldsError()) || this.state.enviando
                    }
                  >
                    {this.state.editar ? 'Editar' : 'Concluir'}
                  </Button>
                </Row>
              </Form>
            </Spin>
          </Permissao>

          <Permissao codTela={this.state.codTela} permissaoNecessaria={[1, 2]}>
            <span className="table-divider">Construtoras cadastradas</span>
            <Divider />
            <Row>
              <Col span={24}>
                <TableConstrutoras
                  codTela={this.state.codTela}
                  construtoras={this.props.construtoras}
                  dispatchConstrutoras={this.dispatchConstrutoras}
                  setFieldValue={this.setFieldValue}
                  resetFields={this.cancelarEdicao}
                />
              </Col>
            </Row>
          </Permissao>
        </div>
        {/* <div
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
        /> */}
      </Content>
    );
  }
}

let Construtora = Form.create()(ConstrutoraForm);
export default (Construtora = connect(store => {
  return {
    construtoras: store.construtoras.data,
    users: store.user,
    permissoes: store.user.permissoes
  };
})(Construtora));
