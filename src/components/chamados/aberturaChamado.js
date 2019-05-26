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
import moment from 'moment';
import axios from 'axios';
import { url, VISITA_ANALISE_TECNICA } from '../../utilities/constants.js';
import { saveUser } from '../../actions/userActions';

const { Content } = Layout;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class AberturaChamadoForm extends React.Component {
  state = {
    enviando: false,
    condominios: false,
    unidades_condominios: [],
    tipologia: [],
    areas_gerais: [],
    areas_comuns: [],
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
    problema_repetido: 0,
    garantia: {}
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

        let unidades = values.unidade.split('_');

        axios
          .post(
            `${url}/chamados`,
            {
              condominio: values.condominios,
              areascomuns: values.areas_comuns,
              areasgerais: values.areas_gerais,
              tipologia: values.tipologia,
              unidade: unidades,
              comentario: values.comentario,
              contato: values.contato,
              user:
                this.state.idUser ||
                this.props.user.id ||
                localStorage.getItem('id'),
              data_visita: values.validade,
              garantia: values.nome_item,
              problema_repetido: this.state.problema_repetido,
              status: VISITA_ANALISE_TECNICA
            },
            config
          )
          .then(res => {
            const { fileList } = this.state;
            const fotosChamado = new FormData();
            fotosChamado.append('ref', 'chamados');
            fotosChamado.append('refId', res.data.id);
            fotosChamado.append('field', 'files');
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
              .then(res => {
                this.setState({
                  fileList: [],
                  uploading: false,
                  enviando: false,
                  condominios: false,
                  mostrarDados: false
                });
                this.props.form.resetFields();
                this.props.next();
                message.success('Chamado enviado com sucesso');
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
            this.setState({ enviando: false, uploading: false, idUser: null });
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
    let cond = '';
    axios
      .get(`${url}/users/me`, config)
      .then(res => {
        this.setState({ idUser: res.data._id });
        cond = res.data.condominios.filter(condominio => condominio._id === id);
        cond.map(idCond => {
          return this.setState({ idCond: idCond._id });
        });
        axios
          .get(`${url}/condominios/${this.state.idCond}`, config)
          .then(res => {
            this.setState({
              condominios: res.data,
              garantiaArray: res.data.garantias,
              tipologia: res.data.torres,
              areas_gerais: res.data.areasgerais,
              areas_comuns: res.data.areascomuns,
              disabledTipologia: false,
              enviando: false,
              mostrarDados: true
            });
          })
          .catch(error => {
            console.log(error);
          });
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

  getUnidade = () => {
    this.setState({ enviando: true });
    let auth = localStorage.getItem('jwt') || this.props.user.jwt;
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    this.state.tipologia.map(value => {
      return axios
        .get(`${url}/tipologias/${value._id}`, config)
        .then(res => {
          res.data.unidadesautonomas.map(unidade => {
            return axios
              .get(`${url}/unidadesautonomas/${unidade._id}`, config)
              .then(res => {
                this.setState({
                  unidades_condominios: res.data.unidades,
                  disabledUnidade: false,
                  disabledAreaComum: false,
                  disabledAreaGeral: false,
                  enviando: false
                });
              });
          });
        })
        .catch(error => console.log(error));
    });
  };

  onChange = e => {
    this.setState({ problema_repetido: e.target.checked });
  };

  chandeAreaTipologiaAreaGeral = id => {
    if (id === '' || id === undefined) return false;
    return this.props.form.setFieldsValue({
      areas_gerais: undefined,
      areas_comuns: undefined
    });
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

  subItens = () => {
    this.setState({
      disabledSubItens: false
    });
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
    const unidadesError =
      isFieldTouched('unidades') && getFieldError('unidades');
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
      <Content style={{ padding: '0 50px' }}>
        <Form
          onSubmit={e => {
            this.state.condominios ? this.handleUpload(e) : null;
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
            {localStorage.getItem('tipo_morador') ||
            this.props.user.tipo_morador ? (
              <Row gutter={16}>
                <Col span={6}>
                  {this.state.mostrarDados === true ? (
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
                            disabled={this.state.disabledTipologia}
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
                  ) : null}
                </Col>
                <Col span={6}>
                  {this.state.mostrarDados === true ? (
                    <Spin spinning={this.state.enviando}>
                      <FormItem
                        validateStatus={unidadesError ? 'error' : ''}
                        help={unidadesError || ''}
                        label="Onde"
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
                            disabled={this.state.disabledUnidade}
                          >
                            {this.state.unidades_condominios.map(
                              (unidade, i) => {
                                return (
                                  <Option
                                    value={unidade._id}
                                    key={unidade._id + i}
                                  >
                                    {unidade.nome}
                                  </Option>
                                );
                              }
                            )}
                          </Select>
                        )}
                      </FormItem>
                    </Spin>
                  ) : null}
                </Col>
                <Col span={6}>
                  {this.state.mostrarDados === true ? (
                    <Spin spinning={this.state.enviando}>
                      <FormItem
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
                            disabled={this.state.disabledAreaComum}
                          >
                            {this.state.areas_comuns.map(
                              (areasTipologia, i) => {
                                return (
                                  <Option
                                    value={areasTipologia._id}
                                    key={
                                      areasTipologia._id +
                                      areasTipologia.areas_tipologias[i] +
                                      i
                                    }
                                  >
                                    {areasTipologia.areas_tipologias[i]}
                                  </Option>
                                );
                              }
                            )}
                          </Select>
                        )}
                      </FormItem>
                    </Spin>
                  ) : null}
                </Col>
                <Col span={6}>
                  {this.state.mostrarDados === true ? (
                    <Spin spinning={this.state.enviando}>
                      <FormItem
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
                            disabled={this.state.disabledAreaGeral}
                          >
                            {this.state.areas_gerais.map((areasComuns, i) => {
                              return (
                                <Option
                                  value={areasComuns._id}
                                  key={
                                    areasComuns._id +
                                    areasComuns.areas_gerais[i] +
                                    i
                                  }
                                >
                                  {areasComuns.areas_gerais[i]}
                                </Option>
                              );
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Spin>
                  ) : null}
                </Col>
              </Row>
            ) : (
              <Row gutter={16}>
                <Col span={6}>
                  {this.state.mostrarDados === true ? (
                    <Spin spinning={this.state.enviando}>
                      <FormItem
                        validateStatus={tipologiaError ? 'error' : ''}
                        help={tipologiaError || ''}
                        label="Tipologia"
                      >
                        {getFieldDecorator('tipologia')(
                          <Select
                            showSearch
                            //mode="tags"
                            // style={{ width: '49.4%' }}
                            placeholder="Tipolgia"
                            optionFilterProp="children"
                            onChange={this.getUnidade}
                            filterOption={(input, option) =>
                              option.props.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={this.state.disabledTipologia}
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
                  ) : null}
                </Col>
                <Col span={6}>
                  {this.state.mostrarDados === true ? (
                    <Spin spinning={this.state.enviando}>
                      <FormItem
                        validateStatus={unidadesError ? 'error' : ''}
                        help={unidadesError || ''}
                        label="Onde"
                      >
                        {getFieldDecorator('unidade')(
                          <Select
                            showSearch
                            //mode="tags"
                            // style={{ width: '49.4%' }}
                            placeholder="Unidade autônoma"
                            optionFilterProp="children"
                            onChange={this.handleChange}
                            filterOption={(input, option) =>
                              option.props.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={this.state.disabledUnidade}
                          >
                            {this.state.unidades_condominios.map(
                              (unidades, i) => {
                                return (
                                  <Option
                                    value={unidades._id}
                                    key={unidades._id + i}
                                  >
                                    {unidades.nome}
                                  </Option>
                                );
                              }
                            )}
                          </Select>
                        )}
                      </FormItem>
                    </Spin>
                  ) : null}
                </Col>
              </Row>
            )}
            {this.state.condominios ? (
              <div>
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
                          //mode="tags"
                          // style={{ width: '49.4%' }}
                          placeholder="Nome do item"
                          optionFilterProp="children"
                          onChange={this.subItens}
                          filterOption={(input, option) =>
                            option.props.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {this.state.garantiaArray.map((garantia, i) => {
                            return (
                              <Option
                                value={garantia._id}
                                key={garantia._id + i}
                              >
                                {garantia.nome}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  {!this.state.disabledSubItens ? (
                    <Col span={6}>
                      <FormItem
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
                            onChange={this.subItens}
                            filterOption={(input, option) =>
                              option.props.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {this.state.garantiaArray.map(garantia => {
                              return Object.keys(garantia.subitem).map(
                                (key, i) => {
                                  return (
                                    <Option
                                      value={garantia._id + '_' + i}
                                      key={
                                        garantia._id +
                                        garantia.subitem[key].subitem
                                      }
                                    >
                                      {garantia.subitem[key].subitem}
                                    </Option>
                                  );
                                }
                              );
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  ) : null}
                </Row>
                {this.state.garantia.subitem &&
                  this.state.garantia.subitem.map(garantia => {
                    if (moment().format('DD/MM/YYYY') > garantia.data_inicio) {
                      console.log('maior');
                    } else {
                      console.log('menor');
                    }
                  })}
              </div>
            ) : (
              <Row>
                <Col span={12}>
                  <FormItem label="Garantia">
                    <strong>
                      Escolha o condomínio para visualizar sua garantia
                    </strong>
                  </FormItem>
                </Col>
              </Row>
            )}
          </Row>

          {this.state.condominios ? (
            <Row>
              <Col span={12}>
                <FormItem
                  validateStatus={validadeError ? 'error' : ''}
                  help={validadeError || ''}
                  label="Escolha o melhor dia para a visita"
                >
                  {getFieldDecorator('validade')(
                    <DatePicker
                      showTime
                      onChange={this.onChangeData}
                      placeholder="Dia para visita"
                      format="DD/MM/YYYY HH:mm:ss"
                      style={{ width: '320px' }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col span={12}>
                <FormItem label="Escolha o melhor dia para a visita">
                  <strong>
                    Escolha o condomínio para agendar a data de visíta
                  </strong>
                </FormItem>
              </Col>
            </Row>
          )}

          {this.state.condominios ? (
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
                  <Checkbox onChange={this.onChange}>
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
                    Escolha o condomínio para deixar sua descrição do problema
                  </strong>
                </FormItem>
              </Col>
            </Row>
          )}

          {this.state.condominios ? (
            <Row>
              <Col span={9}>
                <FormItem>
                  <Upload {...props}>
                    {this.state.fileList.length >= 4 ? (
                      'Máximo 4 fotos'
                    ) : (
                      <Button>
                        <Icon type="upload" /> Você pode carregar até 4 fotos
                      </Button>
                    )}
                  </Upload>
                </FormItem>
              </Col>
            </Row>
          ) : null}
          {this.state.condominios ? (
            <Row type="flex" justify="space-around" align="middle">
              <Col span={12} />
              <Col span={12}>
                <FormItem>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={uploading}
                    disabled={
                      this.state.fileList.length === 0 ||
                      hasErrors(getFieldsError()) ||
                      this.state.enviando
                    }
                  >
                    {uploading ? 'Finalizando' : 'Finalizar Abertura'}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col span={12}>
                <FormItem label="Escolha o melhor dia para a visita">
                  <strong>Escolha o condomínio para enviar suas fotos</strong>
                </FormItem>
              </Col>
            </Row>
          )}
        </Form>
      </Content>
    );
  }
}

let AberturaChamado = Form.create()(AberturaChamadoForm);
export default (AberturaChamado = connect(store => {
  return {
    user: store.user
  };
})(AberturaChamado));
