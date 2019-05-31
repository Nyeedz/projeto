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
import { url, CODE_NENHUMA, CODE_EDITAR } from '../../../utilities/constants';
import { fetchAreasComuns } from '../../../actions/areasComunsActions';
import { fetchCondominios } from '../../../actions/condominioActions';
import { fetchConstrutoras } from '../../../actions/construtoraActions';
import TableAreaComum from './table';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';

const FormItem = Form.Item;
const { Content } = Layout;
const Option = Select.Option;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

let uuid = 0;

class AreasComunsForm extends React.Component {
  state = {
    enviando: false,
    editar: null,
    condominios: [],
    tipologia: [],
    disabledTipo: true,
    disabledCond: true,
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
    codTela: null
  };

  componentDidMount = () => {
    this.dispatchAreasComuns();
    this.props.dispatch(fetchCondominios());
    this.props.dispatch(fetchConstrutoras());
    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
    this.setState({ enviando: false });
    uuid = 0;
  };

  dispatchAreasComuns = () => {
    this.props.dispatch(fetchAreasComuns());
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
      if (!err) {
        let areasTipologias = {};
        this.setState({ enviando: true });
        let auth = localStorage.getItem('jwt');
        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };
        values.names.map((areaTipologia, i) => {
          return JSON.stringify((areasTipologias[i] = areaTipologia));
        });

        axios
          .put(
            `${url}/areascomuns/${this.state.id}`,
            {
              areas_tipologias: areasTipologias,
              condominio: values.condominio,
              construtora: values.construtoras,
              tipologia: values.torre
            },
            config
          )
          .then(() => {
            notification.open({
              message: 'Ok',
              description: 'Área comum da tipologia editada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.dispatchAreasComuns();
            this.props.form.resetFields();
            uuid = 0;
            this.setState({
              enviando: false,
              editar: false,
              id: null
            });
          })
          .catch(() => {
            notification.open({
              message: 'Opps!',
              description: 'Erro ao editar a área comum da tipologia!',
              icon: <Icon type="check" style={{ color: 'red' }} />
            });
            this.setState({
              enviando: false,
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

  handleAreasComuns = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        let areasTipologias = {};
        this.setState({ enviando: true });
        values.names.map((areaTipologia, i) => {
          return JSON.stringify((areasTipologias[i] = areaTipologia));
        });

        let auth = localStorage.getItem('jwt') || this.props.user.jwt;
        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        axios
          .post(
            `${url}/areascomuns`,
            {
              areas_tipologias: areasTipologias,
              condominio: values.condominios,
              construtora: values.construtoras,
              tipologia: values.torre
            },
            config
          )
          .then(() => {
            notification.open({
              message: 'Ok!',
              description: 'Área comum da tipologia cadastrada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.dispatchAreasComuns();
            this.props.form.resetFields();
            uuid = 0;
            this.setState({ enviando: false });
          })
          .catch(() => {
            notification.open({
              message: 'Erro!',
              description: 'Erro ao cadastrar a área comum da tipologia',
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

    let areasGeraisArray = [];
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
        names: areasGeraisArray,
        torre: dados.tipologia._id
      });

      this.setState({
        editar: true,
        id: dados.id,
        disabled: false,
        disabledTipo: false,
        disabledCond: false,
        enviando: false
      });

      Object.keys(dados.areas_tipologias).forEach((area_tipologia, i) => {
        this.add();
        areasGeraisArray[i] = dados.areas_tipologias[area_tipologia];
      });

      this.props.form.setFieldsValue({
        names: areasGeraisArray,
        torre: dados.tipologia._id
      });
    }, 1500);
  };

  cancelarEdicao = () => {
    this.props.form.resetFields();
    this.setState({
      editar: false,
      id: null,
      disabled: false,
      disabledTipo: false
    });
  };

  selectInfoCond = id => {
    let constru = this.props.construtoras.filter(x => x.id === id);
    constru.map((info, i) => {
      return this.setState({
        condominios: info.condominios,
        disabledCond: false
      });
    });
    this.props.form.resetFields();
  };

  selectInfoTipo = id => {
    let tipo = this.props.condominios.filter(x => x.id === id);
    tipo.map((info, i) => {
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
      getFieldValue,
      getFieldsError
    } = this.props.form;

    const torreError = isFieldTouched('torre') && getFieldError('torre');
    const construtorasError =
      isFieldTouched('construtoras') && getFieldError('construtoras');
    const condominiosError =
      isFieldTouched('condominios') && getFieldError('condominios');

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

    const areaComumTipologia = keys.map((k, index) => {
      return (
        <FormItem required={false} key={`nome${k + index}`}>
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
              placeholder={`Área comum da tipologia ${k + 1}`}
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
                <span>Área comum da tipologia</span>
              </h2>
            </div>
            <Form
              onSubmit={e => {
                this.state.editar
                  ? this.handleUpdate(e)
                  : this.handleAreasComuns(e);
              }}
              style={{ width: '90%' }}
            >
              <Spin spinning={this.state.enviando}>
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
                          onChange={this.selectInfoCond}
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
                              <Option value={value.id} key={index + value.id}>
                                {value.nome}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={10} />
                </Row>
              </Spin>
              <Spin spinning={this.state.enviando}>
                <Row>
                  <Col span={4} />
                  <Col span={10}>
                    {areaComumTipologia}
                    <FormItem {...formItemLayout}>
                      <Button
                        type="dashed"
                        onClick={this.add}
                        style={{ width: '100%' }}
                      >
                        <Icon type="plus" /> Área comum da tipologia
                      </Button>
                    </FormItem>
                  </Col>
                </Row>
              </Spin>
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
                      style={{ float: 'right', marginBottom: '2rem' }}
                      loading={this.state.enviando}
                      disabled={
                        (false && hasErrors(getFieldsError())) ||
                        this.state.enviando
                      }
                    >
                      {this.state.editar ? 'Editar' : 'Concluir'}
                    </Button>
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </Permissao>
          <Permissao codTela={this.state.codTela} permissaoNecessaria={[1, 2]}>
            <Divider />
            <Row type="flex" justify="space-around" align="middle">
              <Col span={24}>
                <TableAreaComum
                  codTela={this.state.codTela}
                  areasComuns={this.props.areasComuns}
                  dispatchAreasComuns={this.dispatchAreasComuns}
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

let AreasComuns = Form.create()(AreasComunsForm);
export default (AreasComuns = connect(store => {
  return {
    areasComuns: store.areasComuns.data,
    condominios: store.condominios.data,
    construtoras: store.construtoras.data
  };
})(AreasComuns));
