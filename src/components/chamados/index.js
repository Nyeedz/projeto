import React from 'react';
import { Row, Col, Layout, Steps, Popover } from 'antd';
import './style.css';
import axios from 'axios';

import AberturaChamado from './aberturaChamado';
import PesquisaSatisfacao from './pesquisaSatisfacao';
import { ABERTURA_CHAMADO, url } from '../../utilities/constants';

const { Content } = Layout;
const Step = Steps.Step;

class Chamados extends React.Component {
  steps = [
    {
      title: 'Abertura',
      description: 'de chamado',
      content: <AberturaChamado next={this.next} />,
      status: 0
    },
    {
      title: 'Visita para',
      description: 'análise técnica',
      content: 'visita',
      status: 1
    },
    {
      title: 'Parecer',
      description: 'técnico',
      content: 'parecer',
      status: 2
    },
    {
      title: 'Execução',
      content: 'do chamado',
      description: 'do chamado',
      status: 3
    },
    {
      title: 'Análise',
      content: 'do cliente',
      description: 'do cliente',
      status: 4
    }
  ];

  constructor(props) {
    super(props);
    this.state = {
      current: ABERTURA_CHAMADO
    };
  }

  componentDidMount = () => {
    this.getChamadosUser();
  };

  getChamadosUser = () => {
    let auth = localStorage.getItem('jwt') || this.props.user.jwt;
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(
        `${url}/users/${this.props.user.id || localStorage.getItem('id')}`,
        config
      )
      .then(res => {
        const chamado = res.data.chamados;
        if (chamado) {
          chamado.map(value => {
            this.setState({ current: value.status });
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  next = () => {
    const current = this.state.current + 1;
    this.setState({ current });
  };

  prev = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  };

  get renderContent() {
    switch (this.state.current) {
      case ABERTURA_CHAMADO:
        return <AberturaChamado next={this.next} />;
    }
  }

  render() {
    const { current } = this.state;
    const customDot = (dot, { status, index }) => (
      <Popover
        content={
          <span>
            step {index} status: {status}
          </span>
        }
      >
        {dot}
      </Popover>
    );

    return (
      <Content className="content">
        <Row type="flex" justify="space-around" align="middle">
          <Col span={24} />
        </Row>
        <div style={{ background: '#fff' }}>
          <Steps current={current}>
            {this.steps.map((item, i) => (
              <Step
                key={item.title + i}
                title={item.title}
                description={item.description}
              />
            ))}
          </Steps>
          <div className="steps-content">{this.renderContent}</div>
          {/* <div className="steps-action">
            {this.state.current < steps.length - 1 && (
              <Button type="primary" onClick={() => this.next()}>
                Next
                  </Button>
            )}
            {this.state.current === steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => message.success('Processing complete!')}
              >
                Done
                  </Button>
            )}
            {this.state.current > 0 && (
              <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                Previous
              </Button>
            )}
          </div> */}
        </div>
      </Content>
    );
  }
}

export default Chamados;
