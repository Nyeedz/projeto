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
  PageHeader,
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
    condominios: [],
    selectedCondominio: null,
    selectedChamado: null,
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
    this.loadCondominios();
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
    const chamado = this.state.chamados.find(chamado => chamado.id === id);
    this.setState({
      selectedChamado: chamado
    });
    console.log(chamado);
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
      const res = await axios.get(`${url}/chamados?condominio=${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });

      this.setState({
        selectedCondominio: id,
        chamados: res.data
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
          {this.state.selectedChamado && (
            <div className="chamado-form">
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
              </Form>
            </div>
          )}
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
