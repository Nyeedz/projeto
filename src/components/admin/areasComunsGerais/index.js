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
import { url, CODE_EDITAR } from '../../../utilities/constants';
import { fetchAreasGerais } from '../../../actions/areasGeraisActions';
import { fetchCondominios } from '../../../actions/condominioActions';
import { fetchConstrutoras } from '../../../actions/construtoraActions';
import TableAreaGeral from './table';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';

const FormItem = Form.Item;
const { Content } = Layout;
const Option = Select.Option;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

let uuid = 0;

class AreasGeraisForm extends React.Component {
  state = {
    enviando: false,
    editar: null,
    condominios: [],
    disabled: true,
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
    areacomumgerals: []
  };

  componentDidMount = () => {
    this.dispatchAreasGerais();
    this.props.dispatch(fetchConstrutoras());
    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
    uuid = 0;
    this.setState({ enviando: false });
  };

  dispatchAreasGerais = () => {
    this.props.dispatch(fetchAreasGerais());
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
      let areacomumgerals = [];
      if (!err) {
        const areaGeralCriar = [];

        const areaGeralEditar = values.ids
          .map((id, i) => {
            if (!id) {
              areaGeralCriar.push(values.names[i]);
              return null;
            }

            return { _id: id, name: values.names[i] };
          })
          .filter(value => value);

        const areaGeralExcluir = this.state.areacomumgerals.filter(
          are_geral => {
            return !areaGeralEditar.find(
              areaGeralEditar => areaGeralEditar._id === are_geral._id
            );
          }
        );

        let auth = localStorage.getItem('jwt');
        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        axios
          .put(
            `${url}/areasgerais/${this.state.id}`,
            {
              construtoras: values.construtoras,
              condominios: values.condominios
            },
            config
          )
          .then(res => {
            const filaEditar = areaGeralEditar.map(unidade => {
              return axios.put(
                `${url}/areacomumgerals/${unidade._id}`,
                {
                  nome: unidade.name
                },
                config
              );
            });

            const filaCriar = areaGeralCriar.map(unidade => {
              return axios.post(
                `${url}/areacomumgerals`,
                {
                  nome: unidade,
                  areasgerais: {
                    _id: res.data._id
                  }
                },
                config
              );
            });

            const filaExcluir = areaGeralExcluir.map(unidade => {
              return axios.delete(
                `${url}/areacomumgerals/${unidade._id}`,
                config
              );
            });

            Promise.all([...filaEditar, ...filaCriar, ...filaExcluir])
              .then(values => {
                notification.open({
                  message: 'Ok',
                  description: 'Área geral editada com sucesso!',
                  icon: <Icon type="check" style={{ color: 'green' }} />
                });
                this.props.dispatch(
                  fetchAreasGerais({
                    areacomumgerals: areacomumgerals,
                    construtoras: values.construtoras,
                    condominios: values.condominios,
                    areasgerais: values.areasgerais
                  })
                );
                this.props.form.resetFields();
                uuid = 0;
                this.setState({
                  enviando: false,
                  editar: false,
                  id: null,
                  areacomumgerals: []
                });
              })
              .catch(err => {
                console.log(err, 'erro aqui men');
              });
          })
          .catch(error => {
            notification.open({
              message: 'Opps!',
              description: 'Erro ao editar a área geral!',
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

  handleAreasGerais = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      let areasGerais = {};
      if (!err) {
        this.setState({ enviando: true });
        const areas_gerais = values.names.map(unidade => unidade);

        let auth = localStorage.getItem('jwt');

        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        axios
          .post(
            `${url}/areasgerais`,
            {
              condominio: values.condominio,
              construtora: values.construtoras
            },
            config
          )
          .then(res => {
            const fila = areas_gerais.map(area_geral => {
              return axios.post(
                `${url}/areacomumgerals`,
                {
                  nome: area_geral,
                  areasgerais: res.data._id
                },
                config
              );
            });

            Promise.all(fila)
              .then(() => {
                notification.open({
                  message: 'Ok!',
                  description: 'Área comum geral cadastrada com sucesso!',
                  icon: <Icon type="check" style={{ color: 'green' }} />
                });
                this.dispatchAreasGerais();
                this.props.form.resetFields();
                uuid = 0;
                this.setState({ enviando: false });
              })
              .catch(error => console.log(error));
          })
          .catch(() => {
            notification.open({
              message: 'Erro!',
              description: 'Erro ao cadastrar a área comum geral',
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

    let areaGeralArray = [];
    let areaGeralIdsArray = [];
    uuid = 0;

    this.props.form.setFieldsValue({
      keys: []
    });

    setTimeout(() => {
      this.selectInfo(dados.construtora._id);
      this.props.form.setFieldsValue({
        construtoras: dados.construtora._id
      });

      this.props.form.setFieldsValue({
        names: areaGeralArray
      });

      this.setState({
        enviando: false,
        editar: true,
        id: dados.id,
        areasGerais: dados.areacomumgerals,
        disabled: false
      });

      this.setState({
        areacomumgerals: dados.areacomumgerals
      });

      dados.areacomumgerals.map(area_geral => {
        this.add();
        areaGeralArray.push(area_geral.nome);
        areaGeralIdsArray.push(area_geral._id);
      });

      this.props.form.setFieldsValue({
        names: areaGeralArray,
        ids: areaGeralIdsArray,
        condominio: dados.condominio._id
      });
    }, 1500);
  };

  cancelarEdicao = () => {
    this.props.form.resetFields();
    this.setState({ editar: false, id: null, disabled: true });
  };

  selectInfo = id => {
    let constru = this.props.construtoras.filter(x => x.id === id);
    constru.map(info => {
      return this.setState({
        condominios: info.condominios,
        disabled: false
      });
    });
    this.props.form.resetFields();
  };

  render() {
    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched,
      getFieldValue,
      getFieldsError
    } = this.props.form;

    const construtorasError =
      isFieldTouched('construtoras') && getFieldError('construtoras');
    const condominioError =
      isFieldTouched('condominio') && getFieldError('condominio');

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

    const areasComumGeral = keys.map((k, index) => {
      return (
        <React.Fragment key={k + index + 'fragment'}>
          {getFieldDecorator(`ids[${k}]`)(
            <div key={`ids${k + index + 'ids'}`} />
          )}
          <FormItem required={false} key={`nome${k + index}`}>
            {getFieldDecorator(`names[${k}]`, {
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: `Por favor insira a área comum ${k + 1}`
                }
              ]
            })(
              <Input
                placeholder={`Área comum ${k + 1}`}
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
        </React.Fragment>
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
                <span>Área comum geral</span>
              </h2>
            </div>
            <Spin spinning={this.state.enviando}>
              <Form
                onSubmit={e => {
                  this.state.editar
                    ? this.handleUpdate(e)
                    : this.handleAreasGerais(e);
                }}
                style={{ width: '90%' }}
              >
                <Row gutter={16} style={{ marginTop: '1rem' }}>
                  <Col span={4} />
                  <Col span={10}>
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
                          onChange={this.selectInfo}
                          filterOption={(input, option) =>
                            option.props.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {this.props.construtoras.map((construtora, index) => {
                            return (
                              <Option value={construtora.id} key={index}>
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
                      validateStatus={condominioError ? 'error' : ''}
                      help={condominioError || ''}
                    >
                      {getFieldDecorator('condominio', {
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
                            this.state.disabled
                              ? 'Escolha a construtora para habilitar esta opção'
                              : 'Escolha o condomínio'
                          }
                          disabled={this.state.disabled}
                          optionFilterProp="children"
                          onChange={this.handleChange}
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
                <Row>
                  <Col span={4} />
                  <Col span={10}>
                    {areasComumGeral}
                    <FormItem {...formItemLayout}>
                      <Button
                        type="dashed"
                        onClick={this.add}
                        style={{ width: '100%' }}
                      >
                        <Icon type="plus" /> Área comum geral
                      </Button>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={14} />
                  <Col span={10}>
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
                        loading={this.state.enviando}
                        style={{ float: 'right', marginBottom: '2rem' }}
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
                <TableAreaGeral
                  codTela={this.state.codTela}
                  areasGerais={this.props.areasGerais}
                  selectInfo={this.selectInfo}
                  dispatchAreasGerais={this.dispatchAreasGerais}
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

let AreasGerais = Form.create()(AreasGeraisForm);
export default (AreasGerais = connect(store => {
  return {
    areasGerais: store.areasGerais.data,
    condominios: store.condominios.data,
    construtoras: store.construtoras.data
  };
})(AreasGerais));
