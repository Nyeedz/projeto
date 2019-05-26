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
    codTela: null
  };

  componentDidMount = () => {
    this.dispatchAreasGerais();
    this.props.dispatch(fetchConstrutoras());
    this.props.form.validateFields();
    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
    uuid = 0;
    this.setState({ enviando: false });
  };

  dispatchAreasGerais = () => {
    this.props.dispatch(fetchAreasGerais());
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
      let areasGerais = {};
      if (!err) {
        this.setState({ enviando: true });
        values.names.map((areaGeral, i) => {
          return JSON.stringify((areasGerais[i] = areaGeral));
        });
        let auth = localStorage.getItem('jwt');
        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };
        axios
          .put(
            `${url}/areasgerais/${this.state.id}`,
            {
              areas_gerais: areasGerais,
              condominio: values.condominio,
              construtora: values.construtoras
            },
            config
          )
          .then(res => {
            notification.open({
              message: 'Ok',
              description: 'Área comum geral editada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.dispatchAreasGerais();
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
              description: 'Erro ao editar a área comum geral!',
              icon: <Icon type="check" style={{ color: 'red' }} />
            });
            this.setState({
              enviando: false,
              editar: false,
              id: null
            });
          });
        this.setState({
          enviando: false,
          editar: false,
          id: null
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

  handleAreasGerais = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      let areasGerais = {};
      if (!err) {
        this.setState({ enviando: true });
        values.names.map((areaGeral, i) => {
          return JSON.stringify((areasGerais[i] = areaGeral));
        });

        let auth = localStorage.getItem('jwt');

        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        axios
          .post(
            `${url}/areasgerais`,
            {
              areas_gerais: areasGerais,
              condominio: values.condominio,
              construtora: values.construtoras
            },
            config
          )
          .then(() => {
            notification.open({
              message: 'Ok!',
              description: 'Área comum geral cadastrada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.setState({ enviando: false });
            this.dispatchAreasGerais();
            this.props.form.resetFields();
            uuid = 0;
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
    uuid = 0;

    this.props.form.setFieldsValue({
      keys: []
    });

    setTimeout(() => {
      this.selectInfo(dados.construtora._id);
      this.props.form.setFieldsValue({
        construtoras: dados.construtora._id
      });

      Object.keys(dados.areas_gerais).forEach((area_geral, i) => {
        this.add();
        areaGeralArray[i] = dados.areas_gerais[area_geral];
      });

      this.props.form.setFieldsValue({
        names: areaGeralArray,
        condominio: dados.condominio._id
      });
      this.setState({
        enviando: false,
        editar: true,
        id: dados.id,
        disabled: false
      });
    }, 1500);
  };

  cancelarEdicao = () => {
    this.props.form.resetFields();
    this.setState({ editar: false, id: null, disabled: true });
    this.props.form.validateFields();
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
        <FormItem
          label={index === 0 ? `Área comum` : ''}
          required={false}
          key={`nome${k + index}`}
        >
          {getFieldDecorator(`names[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: true,
                whitespace: true,
                message: `Por favor insira a àrea comum ${k + 1}`
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
                      label={
                        this.state.disabled
                          ? 'Escolha a construtora para habilitar esta opção'
                          : 'Escolha o condomínio'
                      }
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
