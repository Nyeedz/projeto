import {
  Col,
  Form,
  Input,
  Layout,
  message,
  Row,
  Button,
  Icon,
  Select,
  Upload,
  Spin,
  DatePicker,
  Checkbox,
  Radio,
  notification
} from 'antd';
import * as axios from 'axios';
import * as moment from 'moment';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ChamadosAdminTable } from './table';
import { url, PARECER_TECNICO } from '../../../utilities/constants';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';
import './style.css';

import { Header, ChamadosWrapper, TableWrapper } from './components';

const { Content } = Layout;
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

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
    selectedCondominio: undefined,
    selectedChamado: undefined,
    problema_repetido: false,
    fileList: [],
    fotos: [],
    fotosToRemove: [],
    fileListTecnico: [],
    fotosTecnico: [],
    fotosToRemoveTecnico: [],
    loading: false,
    procedente: true
  };

  procedenciaRef = React.createRef();

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
        areasgerais,
        selectedChamado: chamado._id,
        problema_repetido: chamado.problema_repetido,
        fotos: chamado.fotos,
        fileList: [],
        fotosToRemove: [],
        fotosTecnico: chamado.fotosTecnicas,
        fileListTecnico: [],
        fotosToRemoveTecnico: [],
        procedente: chamado.procedente
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
        unidade: chamado.unidade ? chamado.unidade._id : null,
        subitem: chamado.subitem._id,
        data_visita: moment(
          chamado.data_visita.substring(0, 10) +
            '' +
            chamado.data_visita.substring(11, 19),
          'YYYY-MM-DD HH:mm:ss'
        ),
        comentario: chamado.comentario,
        areas_comuns: chamado.areatipologia ? chamado.areatipologia.id : null,
        areas_gerais: chamado.areacomumgeral ? chamado.areacomumgeral.id : null
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
  };

  selectChamado = chamado => {
    this.loadChamado(chamado);
    console.log(chamado);
  };

  condominioChange = async id => {
    try {
      this.props.form.resetFields();
      this.setState({
        selectedCondominio: undefined,
        selectedChamado: undefined
      });
      const jwt = localStorage.getItem('jwt');
      const chamadoRes = await axios.get(`${url}/chamados?condominio=${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      const areasgerais = await this.fetchAreasGerais(id);

      this.setState({
        selectedCondominio: id,
        chamados: chamadoRes.data,
        areasgerais
      });
    } catch (err) {
      message.error('Erro ao buscar dados do chamado!');
      console.log(err);
    }
  };

  tipologiaChange = async id => {
    const unidades = await this.fetchUnidades(id);
    const garantias = await this.fetchGarantias(id);
    const areascomun = await this.fetchAreasComuns(id);
    this.setState({ unidades, garantias, areascomun, subitems: [] });
    this.props.form.resetFields([
      'unidade',
      'garantia',
      'subitem',
      'areas_comuns'
    ]);
  };

  garantiaChange = async id => {
    const subitems = await this.fetchItensGarantia(id);
    this.setState({ subitems });
    this.props.form.resetFields(['subitem']);
  };

  areaTipologiaChange = id => {
    this.props.form.resetFields(['unidade', 'areas_gerais']);
  };

  areaGeralChange = id => {
    this.props.form.resetFields(['unidade', 'areas_comuns']);
  };

  unidadeChange = id => {
    this.props.form.resetFields(['areas_gerais', 'areas_comuns']);
  };

  seeFoto = url => {
    window.open(url, '_blank');
  };

  removeFoto = id => {
    const { fotos, fotosToRemove } = this.state;
    const fotoIndex = fotos.findIndex(foto => foto._id === id);
    const newFotoArray = fotos.filter(foto => foto._id !== id);
    const remove = [...fotosToRemove, fotos[fotoIndex]];

    this.setState({
      fotos: newFotoArray,
      fotosToRemove: remove
    });
  };

  removeFotoTecnica = id => {
    const { fotosTecnico, fotosToRemoveTecnico } = this.state;
    const fotoIndex = fotosTecnico.findIndex(foto => foto._id === id);
    const newFotoArray = fotosTecnico.filter(foto => foto._id !== id);
    const remove = [...fotosToRemoveTecnico, fotosTecnico[fotoIndex]];

    this.setState({
      fotosTecnico: newFotoArray,
      fotosToRemoveTecnico: remove
    });
  };

  saveChamado = async e => {
    e.preventDefault();

    try {
      this.props.form.validateFields(async (err, values) => {
        if (err) {
          return console.log(err);
        }

        this.setState({ enviando: true });

        const chamado = await this.updateChamado(values);
        const exclusao = await Promise.all(
          this.state.fotosToRemove.map(foto => this.excluirFoto(foto._id))
        );

        const exclusaoTecnica = await Promise.all(
          this.state.fotosToRemoveTecnico.map(foto =>
            this.excluirFoto(foto._id)
          )
        );

        if (this.state.fileList.length > 0) {
          const adicao = await this.adicionarFotos();
        }

        if (this.state.fileListTecnico.length > 0) {
          const adicao = await this.adicionarFotosTecnicas();
        }

        notification.success({
          message: 'Sucesso!',
          description: this.state.procedente
            ? `Status do chamado alterado para 'Parecer Técnico'. Você pode visualizar o status do chamado no seu perfil. Aguarde enquanto o laudo é gerado`
            : 'Chamado encerrado devido a improcedência'
        });

        this.setState({
          selectedChamado: undefined,
          problema_repetido: false,
          fileList: [],
          fotos: chamado.fotos,
          fotosToRemove: [],
          fileListTecnico: [],
          fotos: chamado.fotosTecnicas,
          fotosToRemoveTecnico: [],
          enviando: false
        });

        this.condominioChange(this.state.selectedCondominio);
      });
    } catch (err) {
      notification.error({
        message: 'Ops!',
        description:
          'Houve um erro ao finalizar a ação. Tente novamente ou entre em contato com um administrador'
      });
      this.setState({ enviando: false });
    }
  };

  updateChamado = values => {
    const jwt = localStorage.getItem('jwt');
    return axios
      .put(
        `${url}/chamados/${this.state.selectedChamado}`,
        {
          areacomumgeral: values.areas_gerais || null,
          areatipologia: values.areas_comuns || null,
          contato: values.contato,
          garantia: values.garantia,
          subitem: values.subitem,
          comentario: values.comentario,
          tipologia: values.tipologia,
          unidade: values.unidade || null,
          data_visita: values.data_visita.format('YYYY-MM-DD HH:mm:ss'),
          status: PARECER_TECNICO,
          procedente: this.state.procedente,
          motivo_improcedencia: values.improcedencia,
          encerrado: !this.state.procedente
        },
        {
          headers: { Authorization: `Bearer ${jwt}` }
        }
      )
      .then(res => res.data);
  };

  disabledDate = current => {
    return current && current < moment().endOf('day');
  };

  range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }

    return result;
  };

  disabledDateTime = () => {
    return {
      disabledHours: () => this.range(0, 24).splice(4, 20),
      disabledMinutes: () => this.range(30, 60),
      disabledSeconds: () => [55, 56]
    };
  };

  excluirFoto = id => {
    const jwt = localStorage.getItem('jwt');
    return axios
      .delete(`${url}/upload/files/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      .then(res => res.data);
  };

  adicionarFotos = () => {
    const { fileList, selectedChamado } = this.state;
    const jwt = localStorage.getItem('jwt');
    const fotosChamado = new FormData();

    fotosChamado.append('ref', 'chamados');
    fotosChamado.append('refId', selectedChamado);
    fotosChamado.append('field', 'fotos');
    fileList.forEach(file => {
      fotosChamado.append('files', file, file.name);
    });

    const configUpload = {
      headers: {
        Accept: 'multipart/form-data',
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${jwt}`
      }
    };
    return axios.post(`${url}/upload`, fotosChamado, configUpload);
  };

  adicionarFotosTecnicas = () => {
    const { fileListTecnico, selectedChamado } = this.state;
    const jwt = localStorage.getItem('jwt');
    const fotosChamado = new FormData();

    fotosChamado.append('ref', 'chamados');
    fotosChamado.append('refId', selectedChamado);
    fotosChamado.append('field', 'fotosTecnicas');
    fileListTecnico.forEach(file => {
      fotosChamado.append('files', file, file.name);
    });

    const configUpload = {
      headers: {
        Accept: 'multipart/form-data',
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${jwt}`
      }
    };
    return axios.post(`${url}/upload`, fotosChamado, configUpload);
  };

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched
    } = this.props.form;

    const uploadProps = {
      multiple: true,
      onRemove: file => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList
          };
        });
      },
      beforeUpload: file => {
        console.log(file);
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file]
        }));
        return false;
      },
      fileList: this.state.fileList
    };

    const uploadPropsTecnico = {
      multiple: true,
      onRemove: file => {
        this.setState(({ fileListTecnico }) => {
          const index = fileListTecnico.indexOf(file);
          const newFileListTecnico = fileListTecnico.slice();
          newFileListTecnico.splice(index, 1);
          return {
            fileList: newFileListTecnico
          };
        });
      },
      beforeUpload: file => {
        console.log(file);
        this.setState(({ fileListTecnico }) => ({
          fileListTecnico: [...fileListTecnico, file]
        }));
        return false;
      },
      fileList: this.state.fileListTecnico
    };

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
        <ChamadosWrapper>
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
                    value={this.state.selectedCondominio}
                    onChange={this.condominioChange}
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {this.state.condominios.map((condominio, i) => {
                      console.log(condominio);
                      return (
                        <Option value={condominio._id} key={condominio._id + i}>
                          {condominio.nome}
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

          {this.state.selectedCondominio && (
            <TableWrapper>
              <ChamadosAdminTable
                chamados={this.state.chamados}
                selectChamado={this.selectChamado}
              />
            </TableWrapper>
          )}

          {this.state.loading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2em'
              }}
            >
              <Spin />
            </div>
          )}
        </ChamadosWrapper>
        <ChamadosWrapper hidden={!this.state.selectedChamado}>
          <Header>
            <h2 style={{ margin: 0 }}>Chamado</h2>
          </Header>
          <div className="chamado-form">
            <Form onSubmit={this.saveChamado} style={{ padding: '1rem' }}>
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
                        onChange={this.tipologiaChange}
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
                        onChange={this.unidadeChange}
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
                        onChange={this.garantiaChange}
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
              {this.props.user.tipo_morador === false ? (
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
                          onChange={this.areaTipologiaChange}
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
                                      <Option
                                        value={area_tipologia._id}
                                        key={area_tipologia._id + i}
                                      >
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
                          onChange={this.areaGeralChange}
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
                                      <Option
                                        value={area_comum._id}
                                        key={area_comum._id + i}
                                      >
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
              ) : null}
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
                    })(
                      <DatePicker
                        format="YYYY-MM-DD HH:mm:ss"
                        disabledDate={this.disabledDate}
                        disabledTime={this.disabledDateTime}
                        showTime={{
                          defaultValue: moment('00:00:00', 'HH:mm:ss')
                        }}
                      />
                    )}
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
                      <Checkbox
                        checked={this.state.problema_repetido}
                        onChange={() => {
                          this.setState({
                            problema_repetido: !this.state.problema_repetido
                          });
                        }}
                      >
                        Marque se já teve este mesmo problema
                      </Checkbox>
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
              <Row gutter={16}>
                <Col span={12}>
                  <h3>Fotos:</h3>
                  <Upload {...uploadProps}>
                    {this.state.fileList.length + this.state.fotos.length >=
                    4 ? (
                      'Máximo 4 fotos'
                    ) : (
                      <Button>
                        <Icon type="upload" /> Você pode enviar até 4 fotos
                      </Button>
                    )}
                  </Upload>
                  {this.state.fotos.length > 0 && (
                    <div className="fotosGrid">
                      {this.state.fotos.map(foto => {
                        return (
                          <div className="foto" key={foto._id}>
                            <img
                              src={'http://191.252.59.98:7100' + foto.url}
                              alt=""
                            />
                            <div className="foto-options">
                              <Button
                                onClick={() =>
                                  this.seeFoto(
                                    'http://191.252.59.98:7100' + foto.url
                                  )
                                }
                                ghost
                                shape="circle"
                                icon="eye"
                              />
                              <Button
                                onClick={() => this.removeFoto(foto._id)}
                                ghost
                                shape="circle"
                                icon="delete"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Col>
                <Col span={12}>
                  <h3>Fotos técnicas:</h3>
                  <Upload {...uploadPropsTecnico}>
                    {this.state.fileListTecnico.length +
                      this.state.fotosTecnico.length >=
                    4 ? (
                      'Máximo 4 fotos'
                    ) : (
                      <Button>
                        <Icon type="upload" /> Você pode enviar até 4 fotos
                        técnicas
                      </Button>
                    )}
                  </Upload>
                  {this.state.fotosTecnico.length > 0 && (
                    <div className="fotosGrid">
                      {this.state.fotosTecnico.map(foto => {
                        return (
                          <div className="foto" key={foto._id}>
                            <img
                              src={'http://191.252.59.98:7100' + foto.url}
                              alt=""
                            />
                            <div className="foto-options">
                              <Button
                                onClick={() =>
                                  this.seeFoto(
                                    'http://191.252.59.98:7100' + foto.url
                                  )
                                }
                                ghost
                                shape="circle"
                                icon="eye"
                              />
                              <Button
                                onClick={() => this.removeFotoTecnica(foto._id)}
                                ghost
                                shape="circle"
                                icon="delete"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '1rem' }}>
                <Col span={9}>
                  <h3>Situação da procedência</h3>
                  <Radio.Group
                    name="procedencia"
                    value={this.state.procedente}
                    onChange={event =>
                      this.setState({
                        procedente: event.target.value
                      })
                    }
                  >
                    <Radio value={true}>Procedente</Radio>
                    <Radio value={false}>Improcedente</Radio>
                  </Radio.Group>
                  {!this.state.procedente && (
                    <React.Fragment>
                      <h3 style={{ marginTop: '1rem' }}>
                        Motivo da improcedência
                      </h3>
                      <FormItem
                        validateStatus={comentarioError ? 'error' : ''}
                        help={comentarioError || ''}
                        label="Motivo da improcedência"
                      >
                        {getFieldDecorator('improcedencia', {
                          rules: [
                            {
                              required: !this.state.procedente,
                              message: 'O motivo da improcedência é obrigatório'
                            }
                          ]
                        })(<TextArea rows={4} />)}
                      </FormItem>
                    </React.Fragment>
                  )}
                </Col>
              </Row>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  marginTop: '2rem'
                }}
                loading={this.state.enviando}
                disabled={
                  this.state.fileList.length + this.state.fotos.length === 0 ||
                  hasErrors(getFieldsError()) ||
                  this.state.enviando
                }
              >
                {this.state.procedente ? 'Finalizar' : 'Encerrar chamado'}
              </Button>
            </Form>
          </div>
        </ChamadosWrapper>
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
