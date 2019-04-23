import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Form, Layout, Icon, Button, Select, Progress } from 'antd';
import { fetchCondominios } from '../../../actions/condominioActions';

const { Content } = Layout;
const Option = Select.Option;
const FormItem = Form.Item;

class Meta extends React.Component {
  componentWillMount = () => {
    this.props.dispatch(fetchCondominios());
  };

  handleChange = value => {
    console.log(`selected ${value}`);
  };

  handleSubmit = () => {
    console.log('submit');
  };

  render() {
    return (
      <Content style={{ padding: '0 50px', marginTop: '2rem' }}>
        <div style={{ background: '#fff' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, .1)',
              marginTop: '1rem'
            }}
          >
            <h2>
              <span>Metas</span>
            </h2>
          </div>
          <div
            style={{
              padding: '3%'
            }}
          >
            <Form layout="inline" onSubmit={this.handleSubmit}>
              <FormItem>
                <Select
                  showSearch
                  style={{ width: 250 }}
                  placeholder="Escolha o condomínio"
                  optionFilterProp="children"
                  onChange={this.handleChange}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {this.props.condominios.map((condominio, index) => {
                    return (
                      <Option value={condominio.id} key={index}>
                        {condominio.nome}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
              <FormItem>
                <Button type="primary">OK</Button>
              </FormItem>
            </Form>
            <Row style={{ marginTop: '1.5rem' }}>
              <Col span={12}>
                <span style={{ fontWeight: 'bold' }}>
                  Números desde condominio
                </span>
                <p>30 chamados abertos x 15 chamados atendidos</p>
                <Progress percent={50} />
              </Col>
            </Row>
            <Row gutter={48} style={{ marginTop: '1rem', fontSize: '1.2em' }}>
              <Col span={8}>
                <p>Atendimento mensal</p>
                <span
                  style={{
                    borderRadius: '4px',
                    background: '#eee',
                    display: 'inline-block',
                    fontSize: '1.5em',
                    width: '100%',
                    textAlign: 'center',
                    padding: '.5em'
                  }}
                >
                  50%
                </span>
              </Col>
              <Col span={8}>
                <p>Tempo médio para atendimento</p>
                <span
                  style={{
                    borderRadius: '4px',
                    background: '#eee',
                    display: 'inline-block',
                    fontSize: '1.5em',
                    width: '100%',
                    textAlign: 'center',
                    padding: '.5em'
                  }}
                >
                  10 dias
                </span>
              </Col>
              <Col span={8}>
                <p>Conclusão</p>
                <span
                  style={{
                    borderRadius: '4px',
                    background: '#eee',
                    display: 'inline-block',
                    fontSize: '1.5em',
                    width: '100%',
                    textAlign: 'center',
                    padding: '.5em'
                  }}
                >
                  <Icon type="smile-o" /> Bom
                </span>
              </Col>
            </Row>
            <Row
              style={{
                marginTop: '1.5rem',
                borderBottom: '1px solid rgba(0, 0, 0, .1)'
              }}
            >
              <Col span={24}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span style={{ fontWeight: 'bold' }}>
                    Seus indicadores de pesquisa
                  </span>
                  <Button ghost type="primary" style={{ border: 'none' }}>
                    Configurar
                    <Icon type="setting" />
                  </Button>
                </div>
              </Col>
            </Row>
            <Row gutter={48} style={{ marginTop: '1rem', fontSize: '1.2em' }}>
              <Col span={8}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Icon type="frown-o" style={{ fontSize: '2em' }} /> Ruim
                  <span style={{ color: 'black' }}>0 a 3 chamados</span>
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Icon type="meh-o" style={{ fontSize: '2em' }} /> Médio
                  <span style={{ color: 'black' }}>4 a 6 chamados</span>
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Icon type="smile-o" style={{ fontSize: '2em' }} /> Bom
                  <span style={{ color: 'black' }}>6 a 10 chamados</span>
                </div>
              </Col>
            </Row>
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

export default (Meta = connect(store => {
  return {
    condominios: store.condominios.data
  };
})(Meta));
