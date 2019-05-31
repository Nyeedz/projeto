import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Icon,
  Input,
  Layout,
  Row,
  Select,
  notification,
  Spin
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { fetchCondominios } from '../../../actions/condominioActions';
import { fetchConstrutoras } from '../../../actions/construtoraActions';
import { fetchTorre } from '../../../actions/torreActions';
import TableTipologia from './table';

import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';
import { url, CODE_EDITAR } from '../../../utilities/constants';

const FormItem = Form.Item;
const { Content } = Layout;
const Option = Select.Option;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

function onChange(date, dateString) {
  moment(dateString).format('DD/MM/YYYY');
}

class TipologiaForm extends React.Component {
  state = {
    enviando: false,
    editar: null,
    condominios: [],
    disabled: true,
    codTela: null
  };

  componentDidMount = () => {
    this.dispatchTipologia();
    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
  };

  dispatchTipologia = () => {
    this.props.dispatch(fetchTorre());
    this.props.dispatch(fetchCondominios());
    this.props.dispatch(fetchConstrutoras());
  };

  handleUpdate = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ enviando: true });
        let auth = localStorage.getItem('jwt');
        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };
        axios
          .put(
            `${url}/tipologias/${this.state.id}`,
            {
              nome: values.nome,
              validade: values.validade,
              condominio: values.condominio,
              construtoras: values.construtoras
            },
            config
          )
          .then(() => {
            this.dispatchTipologia();
            notification.open({
              message: 'Ok',
              description: 'Tipologia editada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.props.form.resetFields();
            this.setState({
              enviando: false,
              editar: false,
              id: null
            });
          })
          .catch(() => {
            notification.open({
              message: 'Opps!',
              description: 'Erro ao editar a tipologia!',
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

  handleTipologia = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      this.setState({ enviando: true });
      if (!err) {
        let auth = localStorage.getItem('jwt');

        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        // if (
        //   moment(values.validade).startOf('day') <=
        //   moment(this.state.validadeCondominio, 'DD/MM/YYYY')
        // ) {
        //   notification.open({
        //     message: 'Opps',
        //     description: `Validade não pode ser menor ou igual a ${
        //       this.state.validadeCondominio
        //     }`,
        //     icon: <Icon type="warning" style={{ color: 'yellow' }} />
        //   });
        //   this.setState({ enviando: false });
        //   return;
        // } else {
        axios
          .post(
            `${url}/tipologias`,
            {
              nome: values.nome,
              validade: values.validade,
              condominios: values.condominio,
              construtora: values.construtoras
            },
            config
          )
          .then(() => {
            notification.open({
              message: 'Ok!',
              description: 'Tipologia cadastrada com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.dispatchTipologia();
            this.props.form.resetFields();
            this.setState({ enviando: false, disabled: true });
          })
          .catch(() => {
            notification.open({
              message: 'Erro!',
              description: 'Erro ao cadastrar a tipologia',
              icon: <Icon type="close" style={{ color: 'red' }} />
            });
            this.setState({ enviando: false });
          });
        // }
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

    setTimeout(() => {
      this.selectInfo(dados.construtora._id);
      this.props.form.setFieldsValue({
        construtoras: dados.construtora._id
      });

      this.props.form.setFieldsValue({
        condominio: dados.condominios._id
      });

      this.props.form.setFieldsValue({
        nome: dados.nome,
        validade: moment(dados.validade)
      });

      this.setState({
        editar: true,
        id: dados.id,
        disabled: false,
        enviando: false
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

  handleCondominio = id => {
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/condominios/${id}`, config)
      .then(res => {
        this.setState({
          validadeCondominio: moment(res.data.validade).format('DD/MM/YYYY')
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched,
      getFieldsError
    } = this.props.form;

    const nomeError = isFieldTouched('nome') && getFieldError('nome');
    const construtorasError =
      isFieldTouched('construtoras') && getFieldError('construtoras');
    const condominioError =
      isFieldTouched('condominio') && getFieldError('condominio');
    const validadeError =
      isFieldTouched('validade') && getFieldError('validade');

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
                <span>Tipologia</span>
              </h2>
            </div>
            <Spin spinning={this.state.enviando}>
              <Form
                onSubmit={e => {
                  this.state.editar
                    ? this.handleUpdate(e)
                    : this.handleTipologia(e);
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
                          onChange={this.handleCondominio}
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
                      validateStatus={nomeError ? 'error' : ''}
                      help={nomeError || ''}
                    >
                      {getFieldDecorator('nome', {
                        rules: [
                          {
                            required: true,
                            message: 'Entre com o nome da tipologia'
                          }
                        ]
                      })(<Input placeholder="Nome" />)}
                    </FormItem>
                  </Col>
                  <Col span={10}>
                    <FormItem
                      validateStatus={validadeError ? 'error' : ''}
                      help={validadeError || ''}
                    >
                      {getFieldDecorator('validade', {
                        rules: [
                          {
                            required: true,
                            message: 'Entre com a data do início da garantia'
                          }
                        ]
                      })(
                        <DatePicker
                          onChange={onChange}
                          placeholder="Data início da garantia"
                          format="DD/MM/YYYY"
                          style={{ width: '100%' }}
                        />
                      )}
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
                        disabled={
                          hasErrors(getFieldsError()) || this.state.enviando
                        }
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
                <TableTipologia
                  codTela={this.state.codTela}
                  torre={this.props.torre}
                  selectInfo={this.selectInfo}
                  dispatchTipologia={this.dispatchTipologia}
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

let Tipologia = Form.create()(TipologiaForm);
export default (Tipologia = connect(store => {
  return {
    torre: store.torre.data,
    condominios: store.condominios.data,
    construtoras: store.construtoras.data
  };
})(Tipologia));
