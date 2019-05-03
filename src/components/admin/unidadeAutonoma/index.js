import React from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Form,
  Layout,
  Select,
  Input,
  Icon,
  Button,
  notification,
  Divider,
  Spin
} from 'antd';
import axios from 'axios';
import { fetchCondominios } from '../../../actions/condominioActions';
import { fetchConstrutoras } from '../../../actions/construtoraActions';
import { fetchUnidades } from '../../../actions/unidadeActions';
import { fetchTorre } from '../../../actions/torreActions';
import TableUnidade from './table';
import { url, CODE_NENHUMA, CODE_EDITAR } from '../../../utilities/constants';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';

const FormItem = Form.Item;
const { Content } = Layout;
const Option = Select.Option;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

let uuid = 0;

class UnidadeForm extends React.Component {
  state = {
    enviando: false,
    editar: null,
    condominios: [],
    tipologia: [],
    disabledCond: true,
    disabledTipo: true,
    codTela: null,
    loadingUnidades: false
  };

  componentDidMount = () => {
    this.dispatchUnidades();
    this.props.form.validateFields();
    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
    uuid = 0;
  };

  dispatchUnidades = () => {
    this.props.dispatch(fetchUnidades());
    this.props.dispatch(fetchCondominios());
    this.props.dispatch(fetchConstrutoras());
  };

  remove = k => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');

    if (keys.length === 1) {
      return;
    }

    uuid--;

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

  handleUpdate = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      let unidades = {};
      if (!err) {
        this.setState({ enviando: true });
        values.names.map((unidade, i) => {
          return JSON.stringify((unidades[i] = unidade));
        });
        let auth = localStorage.getItem('jwt');
        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };
        axios
          .put(
            `${url}/unidadesautonomas/${this.state.id}`,
            {
              unidades: unidades,
              construtoras: values.construtoras,
              condominios: values.condominios,
              unidade_torres: values.torre
            },
            config
          )
          .then(res => {
            notification.open({
              message: 'Ok',
              description: 'Unidade autônoma editada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.props.dispatch(
              fetchUnidades({
                unidades: unidades,
                construtoras: values.construtoras,
                condominios: values.condominios,
                unidade_torres: values.torre
              })
            );
            this.props.form.resetFields();
            uuid = 0;
            this.setState({
              enviando: false,
              editar: false,
              id: null
            });
          })
          .catch(error => {
            notification.open({
              message: 'Opps!',
              description: 'Erro ao editar a unidade autônoma!',
              icon: <Icon type="check" style={{ color: 'red' }} />
            });
            this.setState({
              enviando: false,
              editar: false,
              id: null
            });
          });
      } else {
        this.setState({ enviando: false });
        notification.open({
          message: 'Opps',
          description: 'Por favor, preencha todos os campos',
          icon: <Icon type="warning" style={{ color: 'yellow' }} />
        });
        this.setState({ enviando: false });
      }
    });
  };

  handleUnidade = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      let unidades = {};
      this.setState({ enviando: true });
      if (!err) {
        values.names.map((unidade, i) => {
          return JSON.stringify((unidades[i] = unidade));
        });

        let auth = localStorage.getItem('jwt');

        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        axios
          .post(
            `${url}/unidadesautonomas`,
            {
              unidades: unidades,
              construtora: values.construtoras,
              condominio: values.condominios,
              tipologia: values.torre
            },
            config
          )
          .then(() => {
            notification.open({
              message: 'Ok!',
              description: 'Unidade autônoma cadastrada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.dispatchUnidades();
            this.props.form.resetFields();
            uuid = 0;
            this.setState({ enviando: false });
          })
          .catch(() => {
            notification.open({
              message: 'Erro!',
              description: 'Erro ao cadastrar a unidade autônoma',
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

  setFieldValue = dados => {
    this.setState({ enviando: true });

    let unidadeArray = [];
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
        names: unidadeArray,
        torre: dados.tipologia._id
      });
      this.setState({
        editar: true,
        enviando: false,
        disabledCond: false,
        disabledTipo: false,
        id: dados.id
      });

      Object.keys(dados.unidades).forEach((value, i) => {
        this.add();
        unidadeArray[i] = dados.unidades[value];
      });

      this.props.form.setFieldsValue({
        names: unidadeArray,
        torre: dados.tipologia._id
      });
    }, 1500);
  };

  cancelarEdicao = () => {
    const { form } = this.props;

    form.resetFields();
    form.validateFields();

    uuid = 0;

    form.setFieldsValue({
      keys: []
    });

    this.setState({
      editar: false,
      id: null,
      disabledCond: true,
      disabledTipo: true
    });
    form.validateFields();
  };

  selectInfoCond = id => {
    uuid = 0;
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
    uuid = 0;
    let tipo = this.props.condominios.filter(x => x.id === id);
    tipo.map(info => {
      return this.setState({
        tipologia: info.torres,
        disabledTipo: false
      });
    });
  };

  render() {
    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched,
      getFieldValue
    } = this.props.form;

    const construtorasError =
      isFieldTouched('construtoras') && getFieldError('construtoras');
    const condominiosError =
      isFieldTouched('condominios') && getFieldError('condominios');
    const torreError = isFieldTouched('torre') && getFieldError('torre');

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

    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');

    const unidadesAutonomas = keys.map((k, index) => {
      return (
        <FormItem
          label={index === 0 ? `Unidades` : ''}
          required={false}
          key={`nome${k + index}`}
        >
          {getFieldDecorator(`names[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: true,
                whitespace: true,
                message: `Por favor insira a unidade autônoma ${k + 1}`
              }
            ]
          })(
            <Input
              placeholder={`Unidade autonôma ${k + 1}`}
              style={{ width: '90%', marginRight: 8 }}
            />
          )}
          {keys.length > 1 ? (
            <Icon
              className="dynamic-delete-button"
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
        <Permissao
          codTela={this.state.codTela}
          permissaoNecessaria={CODE_NENHUMA}
        >
          <span>Não possuí nenhuma permissão</span>
        </Permissao>
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
                <span>Unidade Autônoma</span>
              </h2>
            </div>
            <Spin spinning={this.state.enviando}>
              <Form
                onSubmit={e => {
                  this.state.editar
                    ? this.handleUpdate(e)
                    : this.handleUnidade(e);
                }}
                style={{ width: '90%' }}
              >
                <Row gutter={16} style={{ marginTop: '1rem' }}>
                  <Col span={4} />
                  <Col span={10}>
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
                          {this.props.construtoras.map((construtora, index) => {
                            return (
                              <Option
                                value={construtora.id}
                                key={construtora.id + index}
                              >
                                {construtora.nome}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={10}>
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
                <Row
                  style={{ marginTop: '1rem' }}
                  type="flex"
                  justify="space-around"
                  align="middle"
                  gutter={16}
                >
                  <Col span={4} />
                  <Col span={10}>
                    <FormItem
                      validateStatus={torreError ? 'error' : ''}
                      help={torreError || ''}
                      label={
                        this.state.disabledTipo
                          ? 'Escolha o condomínio para habilitar esta opção'
                          : 'Escolha a tipologia'
                      }
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
                          {this.state.tipologia.map((torre, index) => {
                            return (
                              <Option value={torre.id} key={torre.id + index}>
                                {torre.nome}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={10} />
                </Row>
                <Row gutter={16}>
                  <Col span={4} />
                  <Col span={10}>
                    {unidadesAutonomas}
                    <FormItem {...formItemLayout}>
                      <Button
                        type="dashed"
                        onClick={this.add}
                        style={{ width: '100%' }}
                      >
                        <Icon type="plus" /> Nome
                      </Button>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={16} />
                  <Col span={8}>
                    <FormItem>
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
                        style={{ float: 'right' }}
                        loading={this.state.enviando}
                        disabled={this.state.enviando}
                      >
                        {this.state.editar ? 'Editar' : 'Concluir'}
                      </Button>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </Spin>
          </Permissao>
          <Permissao codTela={this.state.codTela} permissaoNecessaria={[1, 2]}>
            <Divider />
            <Row type="flex" justify="space-around" align="middle">
              <Col span={24}>
                <TableUnidade
                  codTela={this.state.codTela}
                  unidade={this.props.unidade}
                  selectInfoCond={this.selectInfoCond}
                  selectInfoTipo={this.selectInfoTipo}
                  dispatchUnidades={this.dispatchUnidades}
                  setFieldValue={this.setFieldValue}
                  resetFields={this.cancelarEdicao}
                />
              </Col>
            </Row>
          </Permissao>
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
        </div>
      </Content>
    );
  }
}

let Unidade = Form.create()(UnidadeForm);
export default (Unidade = connect(store => {
  return {
    unidade: store.unidade.data,
    torre: store.torre.data,
    condominios: store.condominios.data,
    construtoras: store.construtoras.data
  };
})(Unidade));
