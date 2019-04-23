import React from 'react';
import { Row, Col, Layout, Select, Divider } from 'antd';
import GraficoPergunta from './grafico';

const { Content } = Layout;
const Option = Select.Option;

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

function handleChange(value) {
  console.log(`selected ${value}`);
}

class GraficosTotal extends React.Component {
  componentWillMount = () => {
    this.getChartData();
  };

  constructor() {
    super();

    this.state = {
      chartData: {
        labels: [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez'
        ],
        datasets: [
          {
            label: 'Dados gráfico',
            data: [6, 5, 7, 5, 7.5, 8, 6, 6.5, 8.5, 7, 8, 10],
            backgroundColor: ['rgba(54, 162, 235, 0.2)'],
            borderColor: ['rgba(54, 162, 235, 1)'],
            fill: false
          }
        ]
      }
    };
  }

  getChartData() {
    this.setState({});
  }

  render() {
    const styles = {
      linhacombola: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '10px',
        marginTop: '1rem'
      },
      textoBola: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px'
      },
      linha: {
        height: '27px',
        border: '.8px solid gray'
      },
      bola: {
        width: '10px',
        height: '10px',
        background: 'gray',
        borderRadius: '50%'
      },
      esquerda: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
      }
    };

    return (
      <Content style={{ padding: '0 50px', marginTop: '2rem' }}>
        <div style={{ backgroundColor: '#fff' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, .1)'
            }}
          >
            <h2>
              <span>Resumo de chamados</span>
            </h2>
          </div>
          <Row>
            <Col span={2} />
            <Col span={6}>
              <span
                style={{
                  marginTop: '1rem',
                  textAlign: 'center'
                }}
              >
                Total de chamados abertos
              </span>
              <br />
              <div
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
                152
              </div>
            </Col>
            <Col span={5} style={styles.esquerda}>
              <div style={styles.linhacombola}>
                <div style={styles.bola} />
                <div style={styles.linha} />
                <div style={styles.bola} />
                <div style={styles.linha} />
                <div style={styles.bola} />
              </div>
              <div style={styles.textoBola}>
                <span>100 Nome do condomínio</span>
                <span style={{ marginTop: '.9rem' }}>
                  21 Nome do condomínio
                </span>
                <span style={{ marginTop: '.9rem' }}>
                  31 Nome do condomínio
                </span>
              </div>
            </Col>
            <Col span={11} />
          </Row>
          <Row style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <Col span={2} />
            <Col span={6}>
              <span
                style={{
                  marginTop: '1rem',
                  textAlign: 'center'
                }}
              >
                Total de chamados pendentes
              </span>
              <br />
              <div
                style={{
                  borderRadius: '4px',
                  background: '#eee',
                  display: 'inline-block',
                  fontSize: '1.5em',
                  width: '100%',
                  textAlign: 'center',
                  padding: '.5em',
                  borderBottom: '5px solid green'
                }}
              >
                124
              </div>
            </Col>
            <Col span={5} style={styles.esquerda}>
              <div style={styles.linhacombola}>
                <div style={styles.bola} />
                <div style={styles.linha} />
                <div style={styles.bola} />
                <div style={styles.linha} />
                <div style={styles.bola} />
              </div>
              <div style={styles.textoBola}>
                <span>95 Nome do condomínio</span>
                <span style={{ marginTop: '.9rem' }}>
                  05 Nome do condomínio
                </span>
                <span style={{ marginTop: '.9rem' }}>
                  24 Nome do condomínio
                </span>
              </div>
            </Col>
            <Col span={5}>
              <span
                style={{
                  marginTop: '1rem',
                  textAlign: 'center'
                }}
              >
                Total de chamados improcedentes
              </span>
              <br />
              <div
                style={{
                  borderRadius: '4px',
                  background: '#eee',
                  display: 'inline-block',
                  fontSize: '1.5em',
                  textAlign: 'center',
                  padding: '.5em',
                  width: '100%',
                  borderBottom: '5px solid red'
                }}
              >
                28
              </div>
            </Col>
            <Col span={5} style={styles.esquerda}>
              <div style={styles.linhacombola}>
                <div style={styles.bola} />
                <div style={styles.linha} />
                <div style={styles.bola} />
                <div style={styles.linha} />
                <div style={styles.bola} />
              </div>
              <div style={styles.textoBola}>
                <span>95 Nome do condomínio</span>
                <span style={{ marginTop: '.9rem' }}>
                  05 Nome do condomínio
                </span>
                <span style={{ marginTop: '.9rem' }}>
                  24 Nome do condomínio
                </span>
              </div>
            </Col>
          </Row>
          <Divider />
          <span
            style={{
              color: '#757575',
              fontWeight: 'bold',
              marginLeft: '1rem',
              marginTop: '2rem'
            }}
          >
            Gráficos
          </span>
          <Row style={{ marginTop: '1rem' }}>
            <Col span={2} />
            <Col span={12}>
              <span>Escolha o gráfico</span>
              <Select
                mode="tags"
                style={{
                  width: '100%',
                  marginBottom: '2rem',
                  marginTop: '1rem'
                }}
                placeholder="Gráfico de tempo entre chamados"
                onChange={handleChange}
              >
                {children}
              </Select>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <GraficoPergunta
                chartData={this.state.chartData}
                legendPosition="bottom"
              />
            </Col>
          </Row>
        </div>
      </Content>
    );
  }
}

export default GraficosTotal;
