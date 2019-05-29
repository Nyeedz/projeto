import React from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Layout,
  Icon,
  Button,
  Select,
  notification,
  Radio,
  Form
} from 'antd';
import { fetchFuncionarios } from '../../../actions/funcionariosActions';
import axios from 'axios';
import { url } from '../../../utilities/constants';

const { Content } = Layout;
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class FuncionariosForm extends React.Component {
  state = {
    enviando: false,
    editar: false,
    loading: false,
    funcionarios: [],
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
      { status: 0 }
    ]
  };

  componentDidMount = () => {
    this.getFuncionarios();
    this.props.dispatch(fetchFuncionarios());
  };

  getFuncionarios = () => {
    this.setState({ enviando: true });
    axios
      .get(`${url}/funcionario`)
      .then(res => {
        let data = res.data;
        data.map((value, i) => {
          return this.setState({
            funcionarios: value.users,
            enviando: false
          });
        });
      })
      .catch(error => {
        notification.open({
          message: 'Erro',
          description: 'Erro ao buscar dados da tabela!',
          icon: <Icon type="close" style={{ color: 'red' }} />
        });
        this.setState({ enviando: false });
      });
  };

  setFieldValue = dados => {
    const { form } = this.props;

    this.setState({ id: dados.id });

    form.setFieldsValue({});

    this.setState({
      editar: true
    });
  };

  cancelarEdicao = () => {
    const { form } = this.props;

    form.resetFields();

    this.setState({
      editar: false,
      id: null
    });
  };

  onChangePermissoes = (event, id) => {
    this.setState({
      statusPermissoes: this.state.statusPermissoes.map((permissao, index) => {
        if (index === id) {
          return {
            status: event.target.value
          };
        }
        return permissao;
      })
    });
  };

  render() {
    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched
    } = this.props.form;

    const funcionariosError =
      isFieldTouched('funcionarios') && getFieldError('funcionarios');

    const telas = [
      {
        id: 0,
        nome: 'Construtoras'
      },
      {
        id: 1,
        nome: 'Condomínios'
      },
      {
        id: 2,
        nome: 'Tipologia'
      },
      {
        id: 3,
        nome: 'Unidades autônomas'
      },
      {
        id: 4,
        nome: 'Área comum geral'
      },
      {
        id: 5,
        nome: 'Área comum da tipologia'
      },
      {
        id: 6,
        nome: 'Visualizar Parametrizacao'
      },
      {
        id: 7,
        nome: 'Itens de garantia'
      },
      {
        id: 8,
        nome: 'Pesquisa de satisfação'
      },
      {
        id: 9,
        nome: 'Clientes'
      }
    ];

    return (
      <Content style={{ padding: '0 50px', marginTop: '2rem' }}>
        <div style={{ background: '#fff' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, .1)'
            }}
          >
            <h2>
              <span>Permissões</span>
            </h2>
          </div>
          <div
            style={{
              padding: '3%'
            }}
          >
            <Form>
              <div
                style={{
                  backgroundColor: '#f0f2f5',
                  padding: '10px',
                  marginTop: '1rem'
                }}
              >
                <Row gutter={12}>
                  <Col span={8} />
                  <Col span={8}>
                    <FormItem
                      validateStatus={funcionariosError ? 'error' : ''}
                      help={funcionariosError || ''}
                      label="Escolha os funcionarios"
                    >
                      {getFieldDecorator('funcionarios')(
                        <Select
                          showSearch
                          mode="multiple"
                          style={{ width: '350px' }}
                          placeholder="Escolha o funcionario"
                          optionFilterProp="children"
                          onChange={this.handleChange}
                          filterOption={(input, option) =>
                            option.props.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {this.state.funcionarios.map((funcionario, i) => {
                            return (
                              <Option
                                value={funcionario.id}
                                key={funcionario.id + i}
                              >
                                {funcionario.nome}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8} />
                </Row>
                <span
                  style={{
                    color: '#757575',
                    fontWeight: 'bold',
                    marginLeft: '1rem',
                    marginTop: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  Selecionar permissões
                </span>
                <div
                  style={{ borderBottom: '1px solid #ddd', marginTop: '.5rem' }}
                />

                {telas.map(tela => {
                  return (
                    <Row key={`tela-${tela.id}`}>
                      <Col span={8}>{tela.nome}</Col>
                      <Col span={8}>
                        <RadioGroup
                          onChange={event => {
                            this.onChangePermissoes(event, tela.id);
                          }}
                          value={this.state.statusPermissoes[tela.id].status}
                        >
                          <Radio value={0}>Nenhuma</Radio>
                          <Radio value={1}>Visualizar</Radio>
                          <Radio value={2}>Editar</Radio>
                        </RadioGroup>
                      </Col>
                    </Row>
                  );
                })}

                <Row style={{ padding: 15 }}>
                  <Col span={8} />

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
                    //disabled={
                    //hasErrors(getFieldsError()) || this.state.enviando
                    // }
                  >
                    {this.state.editar ? 'Editar' : 'Salvar'}
                  </Button>
                </Row>
              </div>
            </Form>
          </div>
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

let Funcionarios = Form.create()(FuncionariosForm);
export default (Funcionarios = connect(store => {
  return {
    funcionarios: store.funcionarios.data
  };
})(Funcionarios));
