import React from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Form,
  Layout,
  Icon,
  Button,
  Select,
  Input,
  notification,
  Spin
} from 'antd';
import { fetchConstrutoras } from '../../../actions/construtoraActions';
import { fetchPerguntas } from '../../../actions/perquisaSatisfacaoActions';
import TablePesquisa from './table';
import axios from 'axios';
import { url, CODE_EDITAR } from '../../../utilities/constants';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';
const { Content } = Layout;
const Option = Select.Option;
const FormItem = Form.Item;
let uuid = 0;

const styles = {
  esquerda: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
};

class PesquisaForm extends React.Component {
  state = {
    enviando: false,
    perguntas: [],
    codTela: null
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

  componentDidMount = () => {
    this.dispatchDados();
    this.props.form.validateFields();
    uuid = 0;
    const path = this.props.history.location.pathname;
    this.setState({
      codTela: getCodePath(path)
    });
  };

  dispatchDados = () => {
    this.props.dispatch(fetchConstrutoras());
    this.props.dispatch(fetchPerguntas());
  };

  setFieldValue = dados => {
    const { form } = this.props;
    const { perguntas } = dados;
    let perguntasArray = [];
    uuid = 0;

    this.setState({ id: dados.id });

    form.setFieldsValue({
      keys: []
    });

    setTimeout(() => {
      this.props.form.setFieldsValue({
        construtoras: dados.construtoras.id
      });

      Object.keys(perguntas).forEach((key, index) => {
        this.add();
        perguntasArray[index] = perguntas[key];
      });

      this.props.form.setFieldsValue({
        names: perguntasArray
      });
    }, 200);

    this.setState({
      editar: true
    });
  };

  cancelarEdicao = () => {
    const { form } = this.props;

    form.resetFields();
    form.validateFields();
    uuid = 0;
    form.setFieldsValue({
      keys: []
    });

    this.setState({
      editar: false,
      id: null
    });
  };

  handlePerguntas = e => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFields((err, values) => {
      let p = {};
      this.setState({ enviando: true });
      if (!err) {
        values.names.map((perguntas, i) => {
          return JSON.stringify((p[i] = perguntas));
        });
        const config = {
          headers: { Authorization: 'bearer ' + localStorage.getItem('jwt') }
        };
        axios
          .post(
            `${url}/pesquisasatisfacaos`,
            {
              construtoras: values.construtoras,
              perguntas: p
            },
            config
          )
          .then(res => {
            notification.open({
              message: 'Ok',
              description: 'Pergunta cadastrata com sucesso!',
              icon: <Icon type="check" style={{ color: 'green' }} />
            });
            this.setState({ enviando: false });
            form.resetFields();
            this.props.dispatch(fetchPerguntas());
            uuid = 0;
          })
          .catch(error => {
            notification.open({
              message: 'Erro',
              description: 'Erro ao cadastrar a pergunta!',
              icon: <Icon type="close" style={{ color: 'red' }} />
            });
            console.log(error);
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

  handleUpdate = e => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFields((err, values) => {
      let p = {};
      this.setState({ enviando: true });
      if (!err) {
        values.names.map((perguntas, i) => {
          return JSON.stringify((p[i] = perguntas));
        });

        const config = {
          headers: { Authorization: 'bearer ' + localStorage.getItem('jwt') }
        };

        axios
          .put(
            `${url}/pesquisasatisfacaos/${this.state.id}`,
            {
              construtoras: null,
              perguntas: {}
            },
            config
          )
          .then(res => {
            axios
              .put(
                `${url}/pesquisasatisfacaos/${this.state.id}`,
                {
                  construtoras: values.construtoras,
                  perguntas: p
                },
                config
              )
              .then(res => {
                notification.open({
                  message: 'Ok!',
                  description: 'Pergunta editada com sucesso!',
                  icon: <Icon type="check" style={{ color: 'green' }} />
                });
                form.resetFields();
                this.props.dispatch(fetchPerguntas());
                this.setState({
                  enviando: false,
                  editar: false
                });
                uuid = 0;
              })
              .catch(error => {
                notification.open({
                  message: 'Erro!',
                  description: 'Erro ao editar a pergunta!',
                  icon: <Icon type="close" style={{ color: 'red' }} />
                });
                console.log(error);
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

  render() {
    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched,
      getFieldValue
    } = this.props.form;

    const construtorasError =
      isFieldTouched('construtoras') && getFieldError('construtoras');
    // const perguntaError =
    //   isFieldTouched('pergunta') && getFieldError('pergunta');

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

    const formItems = keys.map((k, index) => {
      return (
        <FormItem
          label={index === 0 ? `Perguntas` : ''}
          required={false}
          key={k}
        >
          {getFieldDecorator(`names[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: true,
                whitespace: true,
                message: 'Por favor insira o texto da pergunta'
              }
            ]
          })(
            <Input
              placeholder={`Pergunta ${k + 1}`}
              style={{ width: '60%', marginRight: 8 }}
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
                <span>Cadastrar Perguntas</span>
              </h2>
            </div>
            <Form
              onSubmit={e => {
                this.state.editar
                  ? this.handleUpdate(e)
                  : this.handlePerguntas(e);
              }}
              style={{ padding: '3%', width: '90%' }}
            >
              <Spin spinning={this.state.enviando}>
                <Row gutter={16} style={{ marginTop: '1rem' }}>
                  <Col span={8} style={styles.esquerda}>
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
                          style={{ width: '350px' }}
                          placeholder="Escolha a construtora"
                          optionFilterProp="children"
                          onChange={this.handleChange}
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
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    {formItems}
                    <FormItem {...formItemLayout}>
                      <Button
                        type="dashed"
                        onClick={this.add}
                        style={{ width: '60%' }}
                      >
                        <Icon type="plus" /> Adicionar Pergunta
                      </Button>
                    </FormItem>
                    <FormItem style={{ marginRight: '1rem' }}>
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
                        style={{ float: 'right' }}
                        loading={this.state.enviando}
                        disabled={this.state.enviando}
                      >
                        {this.state.editar ? 'Editar' : 'Salvar Pesquisa'}
                      </Button>
                    </FormItem>
                  </Col>
                </Row>
              </Spin>
            </Form>
          </Permissao>

          <Permissao codTela={this.state.codTela} permissaoNecessaria={[1, 2]}>
            <Row style={{ marginTop: '2rem' }}>
              <Col span={24}>
                <TablePesquisa
                  codTela={this.state.codTela}
                  perguntas={this.state.perguntas}
                  getPerguntas={this.dispatchDados}
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

let Pesquisa = Form.create()(PesquisaForm);
export default (Pesquisa = connect(store => {
  return {
    construtoras: store.construtoras.data
  };
})(Pesquisa));
