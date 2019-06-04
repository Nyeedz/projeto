import React from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Form,
  Layout,
  Icon,
  Button,
  Select,
  Input,
  Divider,
  notification,
  Spin
} from 'antd';
import { fetchCondominios } from '../../../actions/condominioActions';
import { fetchConstrutoras } from '../../../actions/construtoraActions';
import { fetchGarantias } from '../../../actions/garantiaActions';
import TableGarantia from './table';
import axios from 'axios';
import moment from 'moment';
import { url, CODE_EDITAR } from '../../../utilities/constants';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';
import './table.css';

const { Content } = Layout;
const Option = Select.Option;
const FormItem = Form.Item;

let uuid = 0;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class GarantiaForm extends React.Component {
  state = {
    enviando: false,
    editar: null,
    condominios: [],
    tipologia: [],
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
      { status: 0 }
    ],
    codTela: null,
    disabled: true
  };

  componentDidMount = () => {
    this.dispatchGarantias();
    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
  };

  dispatchGarantias = () => {
    this.props.dispatch(fetchCondominios());
    this.props.dispatch(fetchConstrutoras());
    this.props.dispatch(fetchGarantias());
  };

  setFieldValue = dados => {
    this.setState({ enviando: true });

    let subitemArray = [];
    uuid = 0;

    this.props.form.setFieldsValue({
      keys: []
    });

    setTimeout(() => {
      this.selectInfoCond(dados.construtora._id);
      this.props.form.setFieldsValue({
        construtoras: dados.construtora._id
      });

      this.selectInfoTipo(dados.condominio._id);
      this.props.form.setFieldsValue({
        condominios: dados.condominio._id
      });

      this.props.form.setFieldsValue({
        nome: dados.nome,
        torre: dados.tipologia.id
      });

      Object.keys(dados.subitem).forEach((value, i) => {
        this.add();
        subitemArray[i] = dados.subitem[value];
      });

      this.props.form.setFieldsValue({
        secondary: subitemArray.map(x => x.subitem),
        tempo: subitemArray.map(x => x.tempo_garantia),
        prefix: subitemArray.map(x => x.unidade_garantia)
      });

      this.setState({
        editar: true,
        id: dados.id,
        disabledCond: false,
        disabledTipo: false,
        enviando: false
      });
    }, 1500);
  };

  cancelarEdicao = () => {
    this.props.form.resetFields();
    this.setState({
      editar: false,
      id: null,
      enviando: false,
      disabledCond: true,
      disabledTipo: true
    });
  };

  handleGarantia = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ enviando: true });
        const itens = values.keys.map((k, i) => {
          return {
            subitem: values.secondary[k],
            tempo_garantia: values.prefix[k] == 'a' ? null : values.tempo[k],
            unidade_garantia: values.prefix[k],
            data_inicio: moment(this.state.validadeCondominio).format(
              'DD/MM/YYYY'
            )
          };
        });
        const config = {
          headers: { Authorization: 'bearer ' + localStorage.getItem('jwt') }
        };
        axios
          .post(
            `${url}/garantias`,
            {
              nome: values.nome,
              construtora: values.construtoras,
              condominio: values.condominios,
              tipologia: values.torre,
              subitem: itens
            },
            config
          )
          .then(() => {
            this.props.dispatch(fetchGarantias());
            notification.open({
              message: 'Ok',
              description: 'Garantia cadastrada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.props.form.resetFields();
            this.setState({ enviando: false, disabledCond: true });
            this.add();
            this.props.form.setFieldsValue({
              keys: []
            });
            window.location.href = this.props.history.location.pathname;
          })
          .catch(() => {
            notification.open({
              message: 'Opps!',
              description: 'Erro ao cadastrar a garantia!',
              icon: <Icon type="close" style={{ color: 'red' }} />
            });
            this.setState({ enviando: false });
          });
      } else {
        notification.open({
          message: 'Opps',
          description: 'Por favor, preencha todos os campos',
          icon: <Icon type="warning" style={{ color: 'yellow' }} />
        });
        this.setState({ enviando: false });
      }
      this.setState({ disabledCond: true, enviando: false });
    });
  };

  handleGarantiaUpdate = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ enviando: true });
        const itens = values.keys.map((k, i) => {
          return {
            subitem: values.secondary[k],
            tempo_garantia: values.tempo[k],
            unidade_garantia: values.prefix[k],
            data_inicio: moment().format('DD/MM/YYYY')
          };
        });
        const config = {
          headers: { Authorization: 'bearer ' + localStorage.getItem('jwt') }
        };
        axios
          .put(
            `${url}/garantias/${this.state.id}`,
            {
              nome: values.nome,
              construtora: values.construtoras,
              condominio: values.condominios,
              tipologia: values.torre,
              subitem: itens
            },
            config
          )
          .then(() => {
            this.props.dispatch(fetchGarantias());
            this.props.form.resetFields();
            this.setState({
              enviando: false,
              editar: false,
              id: null
            });
            notification.open({
              message: 'Ok',
              description: 'Garantia editada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
          })
          .catch(error => {
            console.log(error);
            notification.open({
              message: 'Opps!',
              description: 'Erro ao editar a garantia!',
              icon: <Icon type="close" style={{ color: 'red' }} />
            });
            this.setState({ enviando: false });
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

  selectInfoCond = id => {
    let constru = this.props.construtoras.filter(x => x.id === id);
    constru.map(info => {
      return this.setState({
        condominios: info.condominios,
        disabledCond: false
      });
    });
    this.props.form.resetFields();
  };

  selectInfoTipo = id => {
    let tipo = this.props.condominios.filter(x => x.id === id);
    tipo.map(info => {
      return this.setState({
        tipologia: info.torres,
        disabledTipo: false
      });
    });
    {
      this.state.condominios
        ? this.state.condominios.map(condominio => {
            return this.setState({
              validadeCondominio: condominio.validade
            });
          })
        : null;
    }
  };

  remove = k => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    if (keys.length === 1) {
      return;
    }

    form.setFieldsValue({
      keys: keys.filter(key => key !== k)
    });
  };

  add = () => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    uuid++;
    form.setFieldsValue({
      keys: nextKeys
    });
  };

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched,
      getFieldValue
    } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      }
    };

    const construtorasError =
      isFieldTouched('construtoras') && getFieldError('construtoras');
    const condominiosError =
      isFieldTouched('condominios') && getFieldError('condominios');
    const torreError = isFieldTouched('torre') && getFieldError('torre');
    const nomeItemError = isFieldTouched('nome') && getFieldError('nome');

    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');

    const prefixSelector = keys.map(k => {
      return getFieldDecorator(`prefix[${k}]`, {
        validateTrigger: ['onChange', 'onBlur'],
        required: false,
        initialValue: 'd'
      })(
        <Select style={{ width: 140 }}>
          <Option value="d">Dia</Option>
          <Option value="month">Mes</Option>
          <Option value="y">Ano</Option>
          <Option value="a">No ato da entrega</Option>
        </Select>
      );
    });

    const nomeItems = keys.map(k => {
      return (
        <FormItem required={false} key={`nome${k}`}>
          {getFieldDecorator(`secondary[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: true,
                message: 'Entre com o item secundário ou remova este campo'
              }
            ]
          })(<Input placeholder="Item Secundário" />)}
        </FormItem>
      );
    });

    const tempoItems = keys.map(k => {
      return (
        <FormItem required={false} key={`tempo${k}`}>
          {getFieldDecorator(`tempo[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: false,
                message: 'Entre com o tempo da garantia ou remova este campo.'
              }
            ]
          })(
            <Input
              addonBefore={prefixSelector[k]}
              disabled={getFieldValue(`prefix[${k}]`) == 'a'}
              style={{ width: '100%' }}
              placeholder="Tempo garantia"
            />
          )}
        </FormItem>
      );
    });

    const previewData = keys.map((k, i) => {
      return getFieldValue(`prefix[${k}]`) == 'a' ? (
        <div style={{ height: 40, marginBottom: 24 }} key={`preview${k + i}`} />
      ) : (
        <FormItem key={`preview${k + i}`}>
          <span
            style={{
              color: '#FF6600'
            }}
          >
            <Icon type="calendar" style={{ marginRight: '.5rem' }} />
            Data de término:&nbsp;
            {moment(this.state.validadeCondominio)
              .add(getFieldValue(`tempo[${k}]`), getFieldValue(`prefix[${k}]`))
              .format('DD/MM/YYYY')
              .toString()}
          </span>
          {keys.length > 1 ? (
            <Icon
              className="dynamic-delete-button"
              style={{ marginLeft: '15px' }}
              type="minus-circle-o"
              disabled={keys.length === 1}
              onClick={() => this.remove(k)}
            />
          ) : null}
        </FormItem>
      );
    });

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
                <span>Itens de garantia</span>
              </h2>
            </div>
            <Form
              onSubmit={e => {
                this.state.editar
                  ? this.handleGarantiaUpdate(e)
                  : this.handleGarantia(e);
              }}
              style={{ width: '90%' }}
            >
              <div
                style={{
                  padding: '3%'
                }}
              >
                <Spin spinning={this.state.enviando}>
                  <Row gutter={16} style={{ marginTop: '1rem' }}>
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
                            //mode="tags"
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
                                  <Option value={construtora.id} key={index}>
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
                              message: 'Escolha o condomínio'
                            }
                          ]
                        })(
                          <Select
                            showSearch
                            //mode="tags"
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
                                <Option value={condominio.id} key={index}>
                                  {condominio.nome}
                                </Option>
                              );
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Spin>
                <Spin spinning={this.state.enviando}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <FormItem
                        validateStatus={torreError ? 'error' : ''}
                        help={torreError || ''}
                      >
                        {getFieldDecorator('torre', {
                          rules: [
                            {
                              required: true,
                              message: 'Escolha a torre'
                            }
                          ]
                        })(
                          <Select
                            showSearch
                            //mode="tags"
                            style={{ width: '100%' }}
                            placeholder={
                              this.state.disabledTipo
                                ? 'Escolha o condomínio para habilitar esta opção'
                                : 'Escolha a tipologia'
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
                            {this.state.tipologia.map((value, index) => {
                              return (
                                <Option value={value.id} key={index}>
                                  {value.nome}
                                </Option>
                              );
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        validateStatus={nomeItemError ? 'error' : ''}
                        help={nomeItemError || ''}
                      >
                        {getFieldDecorator('nome', {
                          rules: [
                            {
                              required: true,
                              message: 'Entre com o nome do item'
                            }
                          ]
                        })(<Input placeholder="Nome do item" />)}
                      </FormItem>
                    </Col>
                  </Row>
                </Spin>
                <Spin spinning={this.state.enviando}>
                  <Row gutter={8}>
                    <Col span={9}>{nomeItems}</Col>
                    <Col span={10}>{tempoItems}</Col>
                    <Col span={5}>{previewData}</Col>
                  </Row>
                </Spin>
                <FormItem {...formItemLayout}>
                  <Button
                    type="dashed"
                    onClick={this.add}
                    disabled={this.state.disabledTipo}
                    style={{ width: '100%' }}
                  >
                    <Icon type="plus" /> Nome
                  </Button>
                </FormItem>
                <Row>
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
                    disabled={
                      (false && hasErrors(getFieldsError())) ||
                      this.state.enviando
                    }
                  >
                    {this.state.editar ? 'Editar' : 'Concluir'}
                  </Button>
                </Row>
              </div>
            </Form>
          </Permissao>
          <Divider />
          <Permissao codTela={this.state.codTela} permissaoNecessaria={[1, 2]}>
            <Row>
              <Col span={24} id="garantia">
                <TableGarantia
                  codTela={this.state.codTela}
                  garantias={this.props.garantias}
                  dispatchGarantias={this.dispatchGarantias}
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

let Garantia = Form.create()(GarantiaForm);
export default (Garantia = connect(store => {
  return {
    garantias: store.garantias.data,
    condominios: store.condominios.data,
    construtoras: store.construtoras.data
  };
})(Garantia));
