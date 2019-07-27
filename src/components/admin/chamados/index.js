import { Col, Form, Input, Layout, message, Row, Select, Spin } from 'antd';
import * as axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { url } from '../../../utilities/constants';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';

const { Content } = Layout;
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

class ChamadosList extends Component {
  state = {
    codTela: null,
    chamados: [],
    tipologias: [],
    condominios: [],
    unidades: [],
    subitems: [],
    garantias: [],
    areascomun: [],
    areasgerais: [],
    selectedCondominio: null,
    selectedChamado: null,
    loading: false
  };

  componentDidMount = () => {
    const path = this.props.history.location.pathname;

    this.setState({
      codTela: getCodePath(path)
    });

    this.loadCondominios();
  };

  loading = status => {
    this.setState({ loading: status });
  };

  loadCondominios = async () => {
    try {
      this.setState({ enviando: true });
      const jwt = localStorage.getItem('jwt');
      const res = await axios.get(`${url}/users/me`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });

      this.setState({
        condominios: res.data.condominios,
        enviando: false
      });
    } catch (err) {
      message.error('Erro ao buscar dados do chamado!');
      console.log(err);
    }
  };

  loadChamado = async chamado => {
    try {
      const { selectedCondominio } = this.state;
      this.loading(true);
      console.log(chamado);
      const tipologias = await this.fetchTipologias(selectedCondominio);
      const unidades = await this.fetchUnidades(chamado.tipologia._id);
      const garantias = await this.fetchGarantias(chamado.tipologia._id);
      const subitems = await this.fetchItensGarantia(chamado.garantia._id);
      const areascomun = await this.fetchAreasComuns(chamado.tipologia._id);
      const areasgerais = await this.fetchAreasGerais(chamado.condominio._id);

      this.setState({
        tipologias,
        unidades,
        garantias,
        subitems,
        areascomun,
        areasgerais
      });

      console.log({
        tipologias,
        unidades,
        garantias,
        subitems,
        areascomun,
        areasgerais
      });

      this.props.form.setFieldsValue({
        cliente: chamado.user.nome,
        contato: chamado.contato,
        tipologia: chamado.tipologia._id,
        garantia: chamado.garantia._id,
        unidade: chamado.unidade._id,
        subitem: chamado.subitem._id,
        data_visita: chamado.data_visita,
        comentario: chamado.comentario,
        areas_comuns: chamado.areatipologia.id,
        areas_gerais: chamado.areacomumgeral.id,
      });

      this.loading(false);
    } catch (err) {
      console.log(err);
      this.loading(false);
    }
  };

  fetchAreasComuns = id => {
    const jwt = localStorage.getItem('jwt');
    return axios
      .get(`${url}/areascomuns?tipologia=${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      .then(res => res.data);
  };

  fetchAreasGerais = id => {
    const jwt = localStorage.getItem('jwt');
    return axios
      .get(`${url}/areasgerais?condominio=${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      .then(res => res.data);
  };

  fetchTipologias = id => {
    const jwt = localStorage.getItem('jwt');
    return axios
      .get(`${url}/tipologias?condominios=${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      .then(res => res.data);
  };

  fetchUnidades = id => {
    const jwt = localStorage.getItem('jwt');
    return axios
      .get(`${url}/unidades?tipologia=${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      .then(res => res.data);
  };

  fetchGarantias = id => {
    const jwt = localStorage.getItem('jwt');
    return axios
      .get(`${url}/garantias?tipologia=${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      .then(res => res.data);
  };

  fetchItensGarantia = id => {
    const jwt = localStorage.getItem('jwt');
    return axios
      .get(`${url}/subitems?garantia=${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      .then(res => res.data);
  };

  chamadoChange = id => {
    const chamado = this.state.chamados.find(chamado => chamado.id === id);
    this.loadChamado(chamado);
    // chamado.map(value => {
    //   this.setState({
    //     condominios: value.condominio,
    //     comentario: value.comentario,
    //     data_visita: value.data_visita,
    //     garantia: value.garantia,
    //     // data_abertura: value.garantia.data_inicio,
    //     problema_repetido: value.problema_repetido,
    //     torre: value.tipologia,
    //     unidades: value.unidade,
    //     user: value.user,
    //     showContent: true
    //   });
    // });
    // chamado.map(chamado => {
    //   const fotosChamados = chamado.files.map(file => {
    //     return {
    //       uid: file._id,
    //       name: file.name,
    //       status: 'done',
    //       url: `${url}${file.url}`
    //     };
    //   });
    //   this.setState({
    //     fotosChamados
    //   });
    // });
  };

  condominioChange = async id => {
    try {
      this.setState({ enviando: true });
      const jwt = localStorage.getItem('jwt');
      const chamadoRes = await axios.get(`${url}/chamados?condominio=${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      const condominioRes = await axios.get(`${url}/condominios/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });

      this.setState({
        selectedCondominio: id,
        chamados: chamadoRes.data
      });
    } catch (err) {
      message.error('Erro ao buscar dados do chamado!');
      console.log(err);
    }
  };

  render() {
    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched
    } = this.props.form;

    const clienteError = isFieldTouched('cliente') && getFieldError('cliente');
    const contatoError = isFieldTouched('contato') && getFieldError('contato');
    const tipologiaError =
      isFieldTouched('tipologia') && getFieldError('tipologia');
    const unidadeError = isFieldTouched('unidade') && getFieldError('unidade');
    const garantiaError =
      isFieldTouched('garantia') && getFieldError('garantia');
    const subitemError = isFieldTouched('subitem') && getFieldError('subitem');
    const datavisitaError =
      isFieldTouched('data_visita') && getFieldError('data_visita');
    const comentarioError =
      isFieldTouched('comentario') && getFieldError('comentario');
    const areasComunsError =
      isFieldTouched('areas_comuns') && getFieldError('areas_comuns');

    return (
      <Permissao codTela={this.state.codTela} permissaoNecessaria={[1, 2]}>
        <div style={{ background: '#fff', borderRadius: '4px' }}>
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(0, 0, 0, .1)',
              padding: '5px 1rem'
            }}
          >
            <h2>Chamados</h2>
          </div>
          {/* fim do header */}
          <div
            style={{
              padding: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              flexDirection: 'column'
            }}
          >
            {this.state.condominios.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <div>
                  <p>Condomínio: </p>
                  <Select
                    showSearch
                    placeholder="Escolha o condomínio"
                    optionFilterProp="children"
                    style={{ width: 200 }}
                    onChange={this.condominioChange}
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {this.state.condominios.map((condominio, i) => {
                      return (
                        <Option value={condominio.id} key={condominio.id + i}>
                          {condominio.nome}
                        </Option>
                      );
                    })}
                  </Select>
                </div>
                <div style={{ marginLeft: 10 }}>
                  <p>Chamado: </p>
                  <Select
                    showSearch
                    placeholder="Escolha o chamado"
                    optionFilterProp="children"
                    style={{ width: 200 }}
                    disabled={!this.state.selectedCondominio}
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
                </div>
              </div>
            ) : (
              <p>
                Para acessar os chamados é necessário ser responsável por ao
                menos um condomínio
              </p>
            )}
          </div>

          <div
            className="chamado-form"
            // style={{
            //   display:
            //     this.state.selectedChamado && !this.state.loading
            //       ? 'block'
            //       : 'none'
            // }}
          >
            <Form
              onSubmit={e => {
                console.log(e);
              }}
              style={{ padding: '1rem' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    validateStatus={clienteError ? 'error' : ''}
                    help={clienteError || ''}
                    label="Cliente"
                  >
                    {getFieldDecorator('cliente', {
                      rules: [
                        {
                          required: true,
                          message: 'Escolha o cliente'
                        }
                      ]
                    })(<Input placeholder="Cliente" disabled />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    validateStatus={contatoError ? 'error' : ''}
                    help={contatoError || ''}
                    label="Contato"
                  >
                    {getFieldDecorator('contato', {
                      rules: [
                        {
                          required: true,
                          message: 'Contato é necessário'
                        }
                      ]
                    })(<Input placeholder="Contato" disabled />)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    validateStatus={tipologiaError ? 'error' : ''}
                    help={tipologiaError || ''}
                    label="Tipologia"
                  >
                    {getFieldDecorator('tipologia', {
                      rules: [
                        {
                          required: false,
                          message: 'Entre com a tipologia'
                        }
                      ]
                    })(
                      <Select
                        showSearch
                        placeholder="Tipologia"
                        optionFilterProp="children"
                        onChange={this.getUnidade}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        disabled={this.state.disabledTipologia}
                      >
                        {this.state.tipologias.map((tipologia, i) => {
                          return (
                            <Option
                              value={tipologia._id}
                              key={tipologia._id + i}
                            >
                              {tipologia.nome}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    validateStatus={unidadeError ? 'error' : ''}
                    help={unidadeError || ''}
                    label="Unidade"
                  >
                    {getFieldDecorator('unidade', {
                      rules: [
                        {
                          required: false,
                          message: 'Entre com a tipologia'
                        }
                      ]
                    })(
                      <Select
                        showSearch
                        placeholder="Unidade"
                        optionFilterProp="children"
                        // onChange={this.getUnidade}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {this.state.unidades.map((unidade, i) => {
                          return (
                            <Option value={unidade._id} key={unidade._id + i}>
                              {unidade.nome}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    validateStatus={garantiaError ? 'error' : ''}
                    help={garantiaError || ''}
                    label="Garantia"
                  >
                    {getFieldDecorator('garantia', {
                      rules: [
                        {
                          required: false,
                          message: 'Entre com a garantia'
                        }
                      ]
                    })(
                      <Select
                        showSearch
                        placeholder="Garantia"
                        optionFilterProp="children"
                        // onChange={this.getUnidade}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {this.state.garantias.map((garantia, i) => {
                          return (
                            <Option value={garantia._id} key={garantia._id + i}>
                              {garantia.nome}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    validateStatus={subitemError ? 'error' : ''}
                    help={subitemError || ''}
                    label="Subitens da garantia"
                  >
                    {getFieldDecorator('subitem', {
                      rules: [
                        {
                          required: false,
                          message: 'Entre com a subitem'
                        }
                      ]
                    })(
                      <Select
                        showSearch
                        placeholder="Subitem"
                        optionFilterProp="children"
                        // onChange={this.getUnidade}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {this.state.subitems.map((subitem, i) => {
                          return (
                            <Option value={subitem._id} key={subitem._id + i}>
                              {subitem.nome}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    validateStatus={areasComunsError ? 'error' : ''}
                    help={areasComunsError || ''}
                    label="Área comum da tipologia"
                  >
                    {getFieldDecorator('areas_comuns')(
                      <Select
                        showSearch
                        placeholder="Área comum da tipologia"
                        optionFilterProp="children"
                        // onChange={this.changeUnidadeAreaTipologia}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        disabled={this.state.disabledAreaComum}
                      >
                        {this.state.areascomun
                          ? this.state.areascomun.map((area, i) => {
                              return area.areatipologias.map(
                                (area_tipologia, i) => {
                                  return (
                                    <Option value={area_tipologia._id} key={area_tipologia._id + i}>
                                      {area_tipologia.nome}
                                    </Option>
                                  );
                                }
                              );
                            })
                          : null}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    validateStatus={areasComunsError ? 'error' : ''}
                    help={areasComunsError || ''}
                    label="Área comum geral"
                  >
                    {getFieldDecorator('areas_gerais')(
                      <Select
                        showSearch
                        placeholder="Área comum geral"
                        optionFilterProp="children"
                        // onChange={this.changeUnidadeAreaTipologia}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        disabled={this.state.disabledAreaComum}
                      >
                        {this.state.areasgerais
                          ? this.state.areasgerais.map((area, i) => {
                              return area.areacomumgerals.map(
                                (area_comum, i) => {
                                  return (
                                    <Option value={area_comum._id} key={area_comum._id + i}>
                                      {area_comum.nome}
                                    </Option>
                                  );
                                }
                              );
                            })
                          : null}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    validateStatus={datavisitaError ? 'error' : ''}
                    help={datavisitaError || ''}
                    label="Melhor dia para a visita"
                  >
                    {getFieldDecorator('data_visita', {
                      rules: [
                        {
                          required: true,
                          message: 'Data para visita é necessária'
                        }
                      ]
                    })(<Input placeholder="Dia para visita" disabled />)}
                  </FormItem>
                </Col>
              </Row>
              {this.state.selectedCondominio ? (
                <Row>
                  <Col span={24}>
                    <FormItem
                      validateStatus={comentarioError ? 'error' : ''}
                      help={comentarioError || ''}
                      label="Comentário"
                    >
                      {getFieldDecorator('comentario', {
                        rules: [
                          {
                            required: false,
                            message: 'Entre com sua descrição do problema'
                          }
                        ]
                      })(
                        <TextArea
                          rows={10}
                          placeholder="Digite aqui a descrição do problema ..."
                        />
                      )}
                    </FormItem>
                    <FormItem>
                      {/* <Checkbox onChange={this.onChange}>
                        Marque se já teve este mesmo problema
                      </Checkbox> */}
                    </FormItem>
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col span={12}>
                    <FormItem label="Comentário">
                      <strong>
                        Escolha o condomínio para deixar sua descrição do
                        problema
                      </strong>
                    </FormItem>
                  </Col>
                </Row>
              )}
            </Form>
          </div>

          {this.state.loading && <Spin />}
        </div>
      </Permissao>
    );
  }
}

let Chamados = Form.create()(ChamadosList);
export default (Chamados = connect(store => {
  return {
    user: store.user
  };
})(Chamados));
