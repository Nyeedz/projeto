import React from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Layout,
  Form,
  Input,
  Button,
  Spin,
  Select,
  Checkbox,
  Icon,
  message,
  Upload,
  DatePicker,
  Progress
} from 'antd';
import { Redirect } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import {
  url,
  VISITA_ANALISE_TECNICA,
  ABERTURA_CHAMADO
} from '../../utilities/constants.js';
import { selectChamado } from '../../actions/chamadosActions.js';

const { Content } = Layout;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class AberturaChamadoForm extends React.Component {
  state = {
    fotos: [],
    fotosToRemove: [],
    enviando: false,
    condominios: false,
    unidades_condominios: [],
    tipologia: [],
    areas_gerais: [],
    areas_comuns: [],
    disabledGarantia: true,
    disabledTipologia: true,
    disabledUnidade: true,
    disabledAreaComum: true,
    disabledAreaGeral: true,
    disabledSubItens: true,
    fileList: [],
    uploading: false,
    horarioDisabled: true,
    mostrarDados: false,
    idUser: null,
    problema_repetido: false,
    garantia: null,
    validadeTipologia: {}
  };

  componentDidMount = () => {
    this.props.dispatch(selectChamado());

    if (this.props.idChamado) {
      let auth = localStorage.getItem('jwt') || this.props.user.jwt;
      const config = {
        headers: { Authorization: `Bearer ${auth}` }
      };

      axios
        .get(`${url}/chamados/${this.props.idChamado}`, config)
        .then(res => {
          console.log(res.data);
          this.setFieldValue(res.data);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  setFieldValue = async chamado => {
    try {
      this.setState({ enviando: true });

      const tipologias = await this.fetchTipologias(chamado.condominio._id);
      const unidades = await this.fetchUnidades(chamado.tipologia._id);
      const garantias = await this.fetchGarantias(chamado.tipologia._id);
      const garantia = garantias.find(
        garantia => garantia._id === chamado.garantia._id
      );
      const areascomun = await this.fetchAreasComuns(chamado.tipologia._id);
      const areasgerais = await this.fetchAreasGerais(chamado.condominio._id);
      let auth = localStorage.getItem('jwt') || this.props.user.jwt;
      const config = {
        headers: { Authorization: `Bearer ${auth}` }
      };
      axios.get(`${url}/subitems/${chamado.subitem._id}`, config).then(res => {
        let abertura = moment(res.data.data_inicio, 'DD/MM/YYYY').diff(
          moment(res.data.data_criacao, 'DD/MM/YYYY'),
          'days'
        );

        let now = moment(res.data.data_inicio, 'DD/MM/YYYY').diff(
          moment()
            .local()
            .startOf('day'),
          'days'
        );
        let percenteDay = ((100 * now) / abertura - 100) * -1;
        console.log(abertura, 'abertura');
        console.log(now, 'now');

        this.setState({
          validade: true,
          validadeGarantia: now,
          percentData: percenteDay,
          editar: true,
          disabledSubItens: false,
          id: chamado._id,
          fotos: chamado.fotos,
          tipologia: tipologias,
          unidades: unidades,
          comuns: areascomun,
          areaGeral: areasgerais,
          garantias,
          garantia,
          disabledUnidade: false,
          disabledGarantia: false,
          disabledAreaComum: false,
          disabledAreaGeral: false,
          enviando: false,
          validadeTipologia: moment(
            chamado.tipologia.validade.substring(0, 10) +
              '' +
              chamado.tipologia.validade.substring(11, 19),
            'YYYY-MM-DD HH:mm:ss'
          ),
          problema_repetido: chamado.problema_repetido
        });
      });

      this.selectInfoCond(chamado.condominio._id);

      this.props.form.setFieldsValue({
        condominios: chamado.condominio._id,
        tipologia: chamado.tipologia._id,
        unidade: chamado.unidade._id,
        nome_item: chamado.garantia._id,
        areas_comuns: chamado.areatipologia ? chamado.areatipologia.id : null,
        areas_gerais: chamado.areacomumgeral ? chamado.areacomumgeral.id : null,
        validade: moment(
          chamado.data_visita.substring(0, 10) +
            '' +
            chamado.data_visita.substring(11, 19),
          'YYYY-MM-DD HH:mm:ss'
        ),
        comentario: chamado.comentario,
        sub_item: chamado.subitem._id
      });
      this.setState({ enviando: false });
    } catch (error) {
      console.log(error);
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

  adicionarFotos = () => {
    const { fileList } = this.state;
    const jwt = localStorage.getItem('jwt');
    const fotosChamado = new FormData();

    fotosChamado.append('ref', 'chamados');
    fotosChamado.append('refId', this.props.idChamado);
    fotosChamado.append('field', 'fotos');
    fileList.forEach(file => {
      fotosChamado.append('fotos', file, file.name);
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

  excluirFoto = id => {
    const jwt = localStorage.getItem('jwt');
    return axios
      .delete(`${url}/upload/files/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      .then(res => res.data);
  };

  seeFoto = url => {
    window.open(url, '_blank');
  };

  onChangeData = (date, dateString) => {
    moment(dateString).format('DD/MM/YYYY');
    this.setState({ horarioDisabled: false });
  };

  horarioChange = e => {
    this.setState({
      value: e.target.value
    });
  };

  handleUpload = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          uploading: true,
          enviando: true
        });

        let auth = localStorage.getItem('jwt') || this.props.user.jwt;
        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        axios
          .post(
            `${url}/chamados`,
            {
              condominio: values.condominios,
              tipologia: values.tipologia,
              unidade: values.unidade,
              areatipologia: values.areas_comuns,
              areacomumgeral: values.areas_gerais,
              comentario: values.comentario,
              subitem: values.sub_item,
              contato: values.contato,
              data_abertura: moment(),
              user:
                this.state.idUser ||
                this.props.user.id ||
                localStorage.getItem('id'),
              data_visita: values.validade,
              garantia: values.nome_item,
              problema_repetido: this.state.problema_repetido,
              status: ABERTURA_CHAMADO
            },
            config
          )
          .then(res => {
            const { fileList } = this.state;
            const fotosChamado = new FormData();
            fotosChamado.append('ref', 'chamados');
            fotosChamado.append('refId', res.data.id);
            fotosChamado.append('field', 'fotos');
            fileList.forEach(file => {
              fotosChamado.append('files', file, file.name);
            });

            const configUpload = {
              headers: {
                Accept: 'multipart/form-data',
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${auth}`
              }
            };
            axios
              .post(`${url}/upload`, fotosChamado, configUpload)
              .then(() => {
                this.setState({
                  fileList: [],
                  uploading: false,
                  enviando: false,
                  condominios: false,
                  mostrarDados: false
                });
                this.props.form.resetFields();
                // this.props.next();
                message.success('Chamado enviado com sucesso');
                this.props.history.push('/lista-chamados-clientes');
              })
              .catch(error => {
                this.setState({
                  uploading: false,
                  enviando: false,
                  idUser: null
                });
                console.log(error);
                message.error('Erro ao enviar o arquivo.');
              });
          })
          .catch(error => {
            message.error('Erro ao abrir o chamado.');
            console.log(error);
            this.setState({
              enviando: false,
              uploading: false,
              idUser: null
            });
          });
      }
    });
  };

  handleUpdate = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          uploading: true,
          enviando: true
        });

        let auth = localStorage.getItem('jwt') || this.props.user.jwt;
        const config = {
          headers: { Authorization: `Bearer ${auth}` }
        };

        const exclusao = Promise.all(
          this.state.fotosToRemove.map(foto => this.excluirFoto(foto._id))
        ).then(() => {});

        axios
          .put(
            `${url}/chamados/${this.state.id || this.props.idChamado}`,
            {
              condominio: values.condominios,
              tipologia: values.tipologia,
              unidade: values.unidade,
              areatipologia: values.areas_comuns,
              areacomumgeral: values.areas_gerais,
              comentario: values.comentario,
              subitem: values.sub_item,
              data_visita: values.validade,
              garantia: values.nome_item,
              problema_repetido: this.state.problema_repetido
            },
            config
          )
          .then(() => {
            if (this.state.fileList.length > 0) {
              this.adicionarFotos().then(() => {
                message.success('Chamado editado com sucesso');
                this.props.history.push('/lista-chamados-clientes');
                this.setState({
                  fotos: [],
                  fotosToRemove: [],
                  fileList: [],
                  uploading: false,
                  enviando: false,
                  condominios: false,
                  mostrarDados: false,
                  uploading: false,
                  enviando: false,
                  idUser: null,
                  id: null
                });
              });
            } else {
              message.success('Chamado editado com sucesso');
              this.props.history.push('/lista-chamados-clientes');
              this.setState({
                fotos: [],
                fotosToRemove: [],
                fileList: [],
                uploading: false,
                enviando: false,
                condominios: false,
                mostrarDados: false,
                fotos: [],
                fotosToRemove: [],
                fileList: [],
                uploading: false,
                enviando: false,
                condominios: false,
                mostrarDados: false,
                uploading: false,
                enviando: false,
                idUser: null,
                id: null
              });
            }
          });
      }
    });
  };

  selectInfoCond = id => {
    this.setState({ enviando: true });
    let auth = localStorage.getItem('jwt') || this.props.user.jwt;
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    let cond = [];

    axios
      .get(`${url}/users/me`, config)
      .then(res => {
        this.setState({ idUser: res.data._id });
        cond = res.data.condominios.filter(condominio => condominio._id === id);
        res.data.tipologias.map(value => {
          axios.get(`${url}/tipologias/${value._id}`, config).then(() => {
            this.setState({
              tipologia: res.data.tipologias,
              condominios: true,
              disabledTipologia: false,
              enviando: false,
              mostrarDados: true
            });
            res.data.tipologias.areascomun;
          });
        });
        axios
          .get(`${url}/condominios/${id}`, config)
          .then(result => {
            result.data.areasgerais.map(areasgerais => {
              axios
                .get(`${url}/areasgerais/${areasgerais._id}`, config)
                .then(res => {
                  this.setState({ areaGeral: res.data.areacomumgerals });
                })
                .catch(error => console.log(error));
            });
          })
          .catch(error => console.log(error));
      })
      .catch(error => {
        console.log(error);
      });
    this.props.form.resetFields();
    this.setState({
      disabledUnidade: true,
      disabledAreaComum: true,
      disabledAreaGeral: true,
      enviando: false
    });
  };

  getUnidade = id => {
    this.setState({ enviando: true });
    let auth = localStorage.getItem('jwt') || this.props.user.jwt;

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    Promise.all([
      axios.get(`${url}/unidades?tipologia=${id}`, config),
      axios.get(`${url}/garantias?tipologia=${id}`, config),
      axios.get(`${url}/areascomuns?tipologia=${id}`, config),
      axios.get(`${url}/tipologias/${id}`, config)
    ]).then(([unidades, garantias, comuns, tipologias]) => {
      this.setState({
        unidades: unidades.data.filter(unidade =>
          unidade.users.find(user => user._id === this.props.user.id)
        ),
        validadeTipologia: moment(
          tipologias.data.validade.substring(0, 10) +
            '' +
            tipologias.data.validade.substring(11, 19),
          'YYYY-MM-DD HH:mm:ss'
        ),
        garantias: garantias.data,
        comuns: comuns.data,
        disabledUnidade: false,
        disabledGarantia: false,
        disabledAreaComum: false,
        disabledAreaGeral: false,
        enviando: false
      });
    });
  };

  chandeAreaTipologiaAreaGeral = id => {
    if (id === '' || id === undefined) return false;
    return this.props.form.setFieldsValue({
      areas_gerais: undefined,
      areas_comuns: undefined
    });
  };

  changeSubitens = id => {
    if (id) {
      let auth = localStorage.getItem('jwt') || this.props.user.jwt;

      const config = {
        headers: { Authorization: `Bearer ${auth}` }
      };

      axios.get(`${url}/subitems/${id}`, config).then(res => {
        let abertura = moment(res.data.data_inicio, 'DD/MM/YYYY').diff(
          moment(res.data.data_criacao, 'DD/MM/YYYY'),
          'days'
        );

        let now = moment(res.data.data_inicio, 'DD/MM/YYYY').diff(
          moment()
            .local()
            .startOf('day'),
          'days'
        );
        let percenteDay = ((100 * now) / abertura - 100) * -1;

        this.setState({
          validade: true,
          validadeGarantia: now,
          percentData: percenteDay
        });
      });
    }
  };

  changeUnidadeAreaTipologia = id => {
    if (id === '' || id === undefined) return false;
    return this.props.form.setFieldsValue({
      unidade: undefined,
      areas_gerais: undefined
    });
  };

  changeUnidadeAreaComum = id => {
    if (id === '' || id === undefined) return false;
    return this.props.form.setFieldsValue({
      unidade: undefined,
      areas_comuns: undefined
    });
  };

  subItens = id => {
    let auth = localStorage.getItem('jwt') || this.props.user.jwt;
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    axios
      .get(`${url}/garantias/${id}`, config)
      .then(res => {
        this.setState({
          garantia: res.data,
          validade: false,
          disabledSubItens: false
        });
      })
      .catch(error => console.log(error));
  };

  validadeChange = () => {
    this.setState({
      validade: true
    });
  };

  disabledDate = endValue => {
    const { validadeTipologia } = this.state;
    if (!validadeTipologia || !endValue) return false;

    return endValue.valueOf() <= validadeTipologia.valueOf();
  };

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched
    } = this.props.form;

    const clienteError = isFieldTouched('cliente') && getFieldError('cliente');
    const contatoError = isFieldTouched('contato') && getFieldError('contato');
    const condominiosError =
      isFieldTouched('condominios') && getFieldError('condominios');
    const unidadesError = isFieldTouched('unidade') && getFieldError('unidade');
    const tipologiaError =
      isFieldTouched('tipologia') && getFieldError('tipologia');
    const areas_comunsError =
      isFieldTouched('areas_comuns') && getFieldError('areas_comuns');
    const areas_geraisError =
      isFieldTouched('areas_gerais') && getFieldError('areas_gerais');
    const validadeError =
      isFieldTouched('validade') && getFieldError('validade');
    const comentarioError =
      isFieldTouched('comentario') && getFieldError('comentario');
    const nomeItemError =
      isFieldTouched('nome_item') && getFieldError('nome_item');
    const subItemError =
      isFieldTouched('sub_item') && getFieldError('sub_item');

    const user = this.props.user;

    const { uploading } = this.state;

    const props = {
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
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file]
        }));
        return false;
      },
      fileList: this.state.fileList
    };

    return (
      <Content>
        <Form
          onSubmit={e => {
            this.state.editar ? this.handleUpdate(e) : this.handleUpload(e);
          }}
          style={{ width: '100%' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Spin spinning={this.state.enviando}>
                <FormItem
                  validateStatus={clienteError ? 'error' : ''}
                  help={clienteError || ''}
                  label="Cliente"
                >
                  {getFieldDecorator('cliente', {
                    initialValue: user.nome
                  })(<Input placeholder="Cliente" disabled />)}
                </FormItem>
              </Spin>
            </Col>
            <Col span={12}>
              <Spin spinning={this.state.enviando}>
                <FormItem
                  validateStatus={contatoError ? 'error' : ''}
                  help={contatoError || ''}
                  label="Contato"
                >
                  {getFieldDecorator('contato', {
                    initialValue: user.telefone
                  })(<Input placeholder="Contato" disabled />)}
                </FormItem>
              </Spin>
            </Col>
            <Row>
              <Col span={24}>
                <Spin spinning={this.state.enviando}>
                  <FormItem
                    validateStatus={condominiosError ? 'error' : ''}
                    help={condominiosError || ''}
                    label="Escolha o condomínio"
                  >
                    {getFieldDecorator('condominios')(
                      <Select
                        showSearch
                        //mode="tags"
                        style={{ width: '49.4%' }}
                        placeholder="Escolha o condomínio"
                        optionFilterProp="children"
                        onChange={this.selectInfoCond}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {this.props.user.condominios
                          ? this.props.user.condominios.map((condominio, i) => {
                              return (
                                <Option
                                  value={condominio._id}
                                  key={condominio._id + i}
                                >
                                  {condominio.nome}
                                </Option>
                              );
                            })
                          : null}
                      </Select>
                    )}
                  </FormItem>
                </Spin>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Spin spinning={this.state.enviando}>
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
                        placeholder={
                          this.state.disabledUnidade
                            ? 'Escolha o condomínio'
                            : 'Tipologia'
                        }
                        optionFilterProp="children"
                        onChange={this.getUnidade}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        // //disabled={this.state.disabledTipologia}
                      >
                        {this.state.tipologia.map((tipologias, i) => {
                          return (
                            <Option
                              value={tipologias._id}
                              key={tipologias._id + i}
                            >
                              {tipologias.nome}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Spin>
              </Col>
              <Col span={6}>
                <Spin spinning={this.state.enviando}>
                  <FormItem
                    style={{
                      display: this.state.mostrarDados ? 'block' : 'none'
                    }}
                    validateStatus={unidadesError ? 'error' : ''}
                    help={unidadesError || ''}
                    label="Unidade"
                  >
                    {getFieldDecorator('unidade', {
                      rules: [
                        {
                          required: false,
                          message: 'Entre com a unidade'
                        }
                      ]
                    })(
                      <Select
                        showSearch
                        //mode="tags"
                        // style={{ width: '49.4%' }}
                        placeholder={
                          this.state.disabledUnidade
                            ? 'Escolha a tipologia'
                            : 'Unidade autônoma'
                        }
                        optionFilterProp="children"
                        onChange={this.chandeAreaTipologiaAreaGeral}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        //disabled={this.state.disabledUnidade}
                      >
                        {this.state.unidades
                          ? this.state.unidades.map((unidade, i) => {
                              return (
                                <Option
                                  value={unidade._id}
                                  key={unidade._id + i}
                                >
                                  {unidade.nome}
                                </Option>
                              );
                            })
                          : null}
                      </Select>
                    )}
                  </FormItem>
                </Spin>
              </Col>
              <Col span={6}>
                <Spin spinning={this.state.enviando}>
                  <FormItem
                    style={{
                      display:
                        (localStorage.getItem('tipo_morador') === true ||
                          this.props.user.tipo_morador === true) &&
                        this.state.mostrarDados === true
                          ? 'block'
                          : 'none'
                    }}
                    validateStatus={areas_comunsError ? 'error' : ''}
                    help={areas_comunsError || ''}
                    label="Área comum da tipologia"
                  >
                    {getFieldDecorator('areas_comuns')(
                      <Select
                        showSearch
                        //mode="tags"
                        // style={{ width: '49.4%' }}
                        placeholder={
                          this.state.disabledAreaComum
                            ? 'Escolha a tipologia'
                            : 'Área comum da tipologia'
                        }
                        optionFilterProp="children"
                        onChange={this.changeUnidadeAreaTipologia}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        //disabled={this.state.disabledAreaComum}
                      >
                        {this.state.comuns
                          ? this.state.comuns.map(areas_tipologias => {
                              return areas_tipologias.areatipologias.map(
                                (area, i) => {
                                  return (
                                    <Option value={area._id} key={area._id + i}>
                                      {area.nome}
                                    </Option>
                                  );
                                }
                              );
                            })
                          : null}
                      </Select>
                    )}
                  </FormItem>
                </Spin>
              </Col>
              <Col span={6}>
                <Spin spinning={this.state.enviando}>
                  <FormItem
                    style={{
                      display:
                        (localStorage.getItem('tipo_morador') === true ||
                          this.props.user.tipo_morador === true) &&
                        this.state.mostrarDados === true
                          ? 'block'
                          : 'none'
                    }}
                    validateStatus={areas_geraisError ? 'error' : ''}
                    help={areas_geraisError || ''}
                    label="Área comum geral"
                  >
                    {getFieldDecorator('areas_gerais')(
                      <Select
                        showSearch
                        //mode="tags"
                        // style={{ width: '49.4%' }}
                        placeholder={
                          this.state.disabledAreaGeral
                            ? 'Escolha a tipologia'
                            : 'Área comum geral'
                        }
                        optionFilterProp="children"
                        onChange={this.changeUnidadeAreaComum}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        //disabled={this.state.disabledAreaGeral}
                      >
                        {this.state.areaGeral
                          ? this.state.areaGeral.map((area_geral, i) => {
                              return (
                                <Option
                                  value={area_geral._id}
                                  key={area_geral._id + i}
                                >
                                  {area_geral.nome}
                                </Option>
                              );
                            })
                          : null}
                      </Select>
                    )}
                  </FormItem>
                </Spin>
              </Col>
            </Row>
            <div style={{ display: this.state.condominios ? 'block' : 'none' }}>
              <Row gutter={16}>
                <Col span={6}>
                  <FormItem
                    validateStatus={nomeItemError ? 'error' : ''}
                    help={nomeItemError || ''}
                    label="Item Garantia"
                  >
                    {getFieldDecorator('nome_item')(
                      <Select
                        showSearch
                        placeholder="Nome do item"
                        optionFilterProp="children"
                        onChange={this.subItens}
                        //disabled={this.state.disabledGarantia}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {this.state.garantias
                          ? this.state.garantias.map((garantia, i) => {
                              return (
                                <Option
                                  value={garantia._id}
                                  key={garantia._id + i}
                                >
                                  {garantia.nome}
                                </Option>
                              );
                            })
                          : null}
                      </Select>
                    )}
                  </FormItem>
                </Col>

                <Col span={6}>
                  <FormItem
                    style={{
                      display: !this.state.disabledSubItens ? 'block' : 'none'
                    }}
                    validateStatus={subItemError ? 'error' : ''}
                    help={subItemError || ''}
                    label="Subitens garantia"
                  >
                    {getFieldDecorator('sub_item')(
                      <Select
                        showSearch
                        //mode="tags"
                        // style={{ width: '49.4%' }}
                        placeholder="Nome do item"
                        optionFilterProp="children"
                        onChange={this.changeSubitens}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {this.state.garantia === undefined ||
                        this.state.garantia === null ||
                        !this.state.garantia
                          ? null
                          : this.state.garantia.subitems.map(subItem => {
                              return (
                                <Option value={subItem._id} key={subItem._id}>
                                  {subItem.nome}
                                </Option>
                              );
                            })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <div
                    style={{
                      display: this.state.validade ? 'block' : 'none'
                    }}
                  >
                    <Progress
                      type="circle"
                      percent={this.state.percentData}
                      format={percent =>
                        `Faltam ${this.state.validadeGarantia} dias`
                      }
                    />
                  </div>
                </Col>
              </Row>
            </div>
            <Row style={{ display: this.state.condominios ? 'none' : 'block' }}>
              <Col span={12}>
                <FormItem label="Garantia">
                  <strong>
                    Escolha o condomínio para visualizar sua garantia
                  </strong>
                </FormItem>
              </Col>
            </Row>
          </Row>
          <Row style={{ display: this.state.condominios ? 'block' : 'none' }}>
            <Col span={12}>
              <FormItem
                validateStatus={validadeError ? 'error' : ''}
                help={validadeError || ''}
                label="Escolha o melhor dia para a visita"
              >
                {getFieldDecorator('validade')(
                  <DatePicker
                    format="YYYY-MM-DD HH:mm:ss"
                    disabledDate={this.disabledDate}
                    showTime={{
                      defaultValue: moment('00:00:00', 'HH:mm:ss')
                    }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ display: !this.state.condominios ? 'block' : 'none' }}>
            <Col span={12}>
              <FormItem label="Escolha o melhor dia para a visita">
                <strong>
                  Escolha o condomínio para agendar a data de visíta
                </strong>
              </FormItem>
            </Col>
          </Row>
          <Row style={{ display: this.state.condominios ? 'block' : 'none' }}>
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
                  onChange={() => {
                    this.setState({
                      problema_repetido: !this.state.problema_repetido
                    });
                  }}
                  checked={this.state.problema_repetido}
                >
                  Marque se já teve este mesmo problema
                </Checkbox>
              </FormItem>
            </Col>
          </Row>
          <Row style={{ display: !this.state.condominios ? 'block' : 'none' }}>
            <Col span={12}>
              <FormItem label="Comentário">
                <strong>
                  Escolha o condomínio para deixar sua descrição do problema
                </strong>
              </FormItem>
            </Col>
          </Row>
          <Row style={{ display: this.state.condominios ? 'block' : 'none' }}>
            <Col span={9}>
              <FormItem>
                <Upload {...props}>
                  {this.state.fileList.length + this.state.fotos.length >= 4 ? (
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
                          <img src={`${url}${foto.url}`} alt="" />
                          <div className="foto-options">
                            <Button
                              onClick={() => this.seeFoto(`${url}${foto.url}`)}
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
              </FormItem>
            </Col>
          </Row>
          <Row
            style={{ display: this.state.condominios }}
            type="flex"
            justify="space-around"
            align="middle"
          >
            <Col span={12} />
            <Col span={12}>
              <FormItem>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={uploading}
                  disabled={hasErrors(getFieldsError()) || this.state.enviando || this.state.fileList.length === 0}
                >
                  {this.state.editar ? 'Editar chamado' : 'Finalizar Abertura'}
                </Button>
              </FormItem>
            </Col>
          </Row>
          <Row style={{ display: !this.state.condominios ? 'block' : 'none' }}>
            <Col span={12}>
              <FormItem label="Escolha o melhor dia para a visita">
                <strong>Escolha o condomínio para enviar suas fotos</strong>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Content>
    );
  }
}

let AberturaChamado = Form.create()(AberturaChamadoForm);
export default (AberturaChamado = connect(store => {
  return {
    user: store.user,
    chamados: store.chamados
  };
})(AberturaChamado));
