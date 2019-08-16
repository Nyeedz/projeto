import React from 'react';
import { Row, Col, Layout, Steps, Popover, Button, message } from 'antd';
import './style.css';
import axios from 'axios';

import AberturaChamado from './aberturaChamado';
import VisitaTecnica from './visitaTecnica';
import PesquisaSatisfacao from './pesquisaSatisfacao';
import { ABERTURA_CHAMADO, url } from '../../utilities/constants';
import { runInThisContext } from 'vm';
import ParecerTecnico from './parecerTecnico';

const { Content } = Layout;
const Step = Steps.Step;

class Chamados extends React.Component {
  steps = [
    {
      title: 'Abertura',
      description: 'de chamado',
      content: null,
      status: 0
    },
    {
      title: 'Visita para',
      description: 'análise técnica',
      content: null,
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
      current: 0,
      chamado: null,
      idChamado: ''
    };

    if (props.match.params.id) {
      this.loadChamado(props.match.params.id);
    }
  }

  componentDidMount = () => {
    this.steps[0].content = (
      <AberturaChamado
        history={this.props.history}
        idChamado={this.props.match.params.id}
        next={this.next}
      />
    );
    this.setState({
      current: 0
    });
  };

  loadChamado = async id => {
    try {
      let auth = localStorage.getItem('jwt') || this.props.user.jwt;
      const config = {
        headers: { Authorization: `Bearer ${auth}` }
      };
      const res = await axios.get(`${url}/chamados/${id}`, config);
      console.log(res)
      this.selectStep(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  selectStep = async chamado => {
    switch (chamado.status) {
      case 1:
        this.steps[1].content = <VisitaTecnica chamado={chamado} />;
        this.setState({
          current: 1
        });
        break;
      case 2:
        this.steps[2].content = <ParecerTecnico chamado={chamado} />;
        this.setState({
          current: 2
        });
        break;
      default:
        break;
    }
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
        <Steps current={current}>
          {this.steps.map(item => (
            <Step
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </Steps>
        <div
          style={{ background: '#fff', borderRadius: '4px', padding: '1em' }}
        >
          {this.steps[current].content}
        </div>
      </Content>
    );
  }
}

export default Chamados;
