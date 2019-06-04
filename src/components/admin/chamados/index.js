import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as axios from 'axios';
import moment from 'moment';
import {
  Row,
  Col,
  Layout,
  message,
  Form,
  Select,
  Input,
  DatePicker,
  Upload,
  Icon,
  Modal
} from 'antd';
import { url } from '../../../utilities/constants';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';

const { Content } = Layout;
const FormItem = Form.Item;
const Option = Select.Option;

class ChamadosList extends Component {
  state = {
    enviando: false,
    codTela: null,
    chamados: [],
    showContent: false,
    previewVisible: false,
    previewImage: '',
    fotosChamados: []
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
  };

  componentDidMount = () => {
    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
    this.getFuncionario();
    this.getChamados();
  };

  getChamados = () => {
    this.setState({ enviando: true });
    let auth = localStorage.getItem('jwt');
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    axios
      .get(`${url}/chamados`, config)
      .then(res => {
        this.setState({
          chamados: res.data,
          enviando: false
        });
        res.data.map(value => {
          return this.setState({
            chamadosId: value.condominio._id
          });
        });
      })
      .catch(error => {
        message.error('Erro ao buscar dados do chamado!');
        console.log(error);
      });
  };

  getFuncionario = () => {
    this.setState({ enviando: true });
    let auth = localStorage.getItem('jwt');
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    let funcionarioId = '';
    axios
      .get(`${url}/users/me`, config)
      .then(res => {
        res.data.condominios.map(condominio => {
          return this.setState({ condominios_funcionario: condominio._id });
        });
      })
      .catch(error => {
        message.error('Erro ao buscar dados do funcionário');
        console.log(error);
      });
  };

  chamadoChange = id => {
    let chamado = this.state.chamados.filter(x => x.id === id);
    chamado.map(value => {
      this.setState({
        condominios: value.condominio,
        comentario: value.comentario,
        data_visita: value.data_visita,
        garantia: value.garantia,
        // data_abertura: value.garantia.data_inicio,
        problema_repetido: value.problema_repetido,
        torre: value.tipologia,
        unidades: value.unidade,
        user: value.user,
        showContent: true
      });
    });
    chamado.map(chamado => {
      const fotosChamados = chamado.files.map(file => {
        return {
          uid: file._id,
          name: file.name,
          status: 'done',
          url: `${url}${file.url}`
        };
      });
      this.setState({
        fotosChamados
      });
    });
  };

  render() {
    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched
    } = this.props.form;

    const clienteError = isFieldTouched('cliente') && getFieldError('cliente');
    const condominioError =
      isFieldTouched('condominio') && getFieldError('condominio');
    const enderecoError =
      isFieldTouched('endereco') && getFieldError('endereco');
    const garantiaError =
      isFieldTouched('garantia') && getFieldError('garantia');
    const problemaError =
      isFieldTouched('problema') && getFieldError('problema');
    const dataAberturaError =
      isFieldTouched('data_abertura') && getFieldError('data_abertura');
    const dataAgendamentoError =
      isFieldTouched('data_agendamento') && getFieldError('data_agendamento');

    const { previewVisible, previewImage } = this.state;

    return (
      <Content>
        <div style={{ background: '#fff' }}>
          <Permissao codTela={this.state.codTela} permissaoNecessaria={[1, 2]}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                borderBottom: '1px solid rgba(0, 0, 0, .1)',
                padding: 5
              }}
            >
              <h2>
                <span>Chamados</span>
              </h2>
            </div>
            {this.state.condominios_funcionario === this.state.chamadosId ? (
              <Form style={{ width: '90%', marginTop: '1rem' }}>
                <Row guter={16}>
                  <Col span={4} />
                  <Col span={20}>
                    <FormItem
                      validateStatus={clienteError ? 'error' : ''}
                      help={clienteError || ''}
                    >
                      {getFieldDecorator('cliente', {
                        rules: [
                          {
                            required: true,
                            message: 'Escolha o chamado'
                          }
                        ]
                      })(
                        <Select
                          showSearch
                          // mode="tags"
                          style={{ width: '100%' }}
                          placeholder="Escolha o chamado"
                          optionFilterProp="children"
                          onChange={this.chamadoChange}
                          filterOption={(input, option) =>
                            option.props.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {this.state.chamados.map((chamado, i) => {
                            return (
                              <Option value={chamado.id} key={chamado.id + i}>
                                {chamado.user.username}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                {this.state.showContent ? (
                  <div>
                    <Row gutter={16}>
                      <Col span={4} />
                      <Col span={10}>
                        <FormItem
                          validateStatus={condominioError ? 'error' : ''}
                          help={condominioError || ''}
                        >
                          {getFieldDecorator('condominio')(
                            <strong>
                              <label>{this.state.condominios.nome}</label>
                            </strong>
                          )}
                        </FormItem>
                      </Col>
                      <Col span={10}>
                        <FormItem
                          validateStatus={enderecoError ? 'error' : ''}
                          help={enderecoError || ''}
                        >
                          {getFieldDecorator('endereco')(
                            <strong>
                              <label>
                                {this.state.condominios.endereco} -{' '}
                                {this.state.condominios.bairro} -{' '}
                                {this.state.condominios.cidade} /{' '}
                                {this.state.condominios.estado}
                              </label>
                            </strong>
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={4} />
                      <Col span={10}>
                        <FormItem
                          validadeStatus={garantiaError ? 'error' : ''}
                          help={garantiaError || ''}
                        >
                          {getFieldDecorator('garantia')(
                            <strong>
                              <label>{this.state.garantia.nome}</label>
                            </strong>
                          )}
                        </FormItem>
                      </Col>
                      <Col span={10}>
                        <FormItem
                          validadeStatus={problemaError ? 'error' : ''}
                          help={problemaError || ''}
                        >
                          {getFieldDecorator('problema', {
                            initialValue: this.state.comentario
                          })(
                            <Input.TextArea
                              placeholder="Problema"
                              rows={4}
                              disabled
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={4} />
                      <Col span={10}>
                        <FormItem
                          validateStatus={dataAberturaError ? 'error' : ''}
                          help={dataAberturaError || ''}
                        >
                          {getFieldDecorator('data_abertura', {
                            initialValue: moment(this.state.data_abertura),
                            rules: [
                              {
                                required: true,
                                message: 'Entre com a data de abertuda'
                              }
                            ]
                          })(
                            <DatePicker
                              showTime
                              placeholder="Dia para visita"
                              format="DD/MM/YYYY HH:mm:ss"
                              style={{ width: '320px' }}
                              disabled={true}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={10}>
                        <FormItem
                          validateStatus={dataAgendamentoError ? 'error' : ''}
                          help={dataAgendamentoError || ''}
                        >
                          {getFieldDecorator('data_agendamento', {
                            initialValue: moment(this.state.data_visita),
                            rules: [
                              {
                                required: true,
                                message: 'Entre com a data de agendamento'
                              }
                            ]
                          })(
                            <DatePicker
                              showTime
                              placeholder="Dia para visita"
                              format="DD/MM/YYYY HH:mm:ss"
                              style={{ width: '320px' }}
                            />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={4} />
                      <Col span={12}>
                        <FormItem>
                          <div className="clearfix">
                            <Upload
                              action="//jsonplaceholder.typicode.com/posts/"
                              listType="picture-card"
                              fileList={this.state.fotosChamados}
                              onPreview={this.handlePreview}
                              onChange={this.handleChange}
                            />
                            <Modal
                              visible={previewVisible}
                              footer={null}
                              onCancel={this.handleCancel}
                            >
                              <img
                                alt="example"
                                style={{ width: '100%' }}
                                src={previewImage}
                              />
                            </Modal>
                          </div>
                        </FormItem>
                      </Col>
                    </Row>
                  </div>
                ) : null}
              </Form>
            ) : (
              <FormItem>
                <Row gutter={16}>
                  <Col span={6} />
                  <Col span={12}>
                    <span>
                      Não há chamados em aberto para os condomínios no qual você
                      é responsável
                    </span>
                  </Col>
                </Row>
              </FormItem>
            )}
          </Permissao>
        </div>
      </Content>
    );
  }
}

let Chamados = Form.create()(ChamadosList);
export default (Chamados = connect(store => {
  return {
    user: store.user
  };
})(Chamados));
