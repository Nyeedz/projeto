import { Col, Layout, Row } from 'antd';
import axios from 'axios';
import React from 'react';
import { connect } from 'react-redux';
import { getCodePath } from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';
import { url } from '../../../utilities/constants';
import TableParametrizacao from './table';

const { Content } = Layout;

class Parametrizacao extends React.Component {
  state = {
    codTela: null,
    construtoras: [],
    teste: []
  };

  componentDidMount = () => {
    const path = this.props.history.location.pathname;

    this.setState({
      codTela: getCodePath(path)
    });

    this.getConstrutoras();
  };

  async getConstrutoras() {
    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
    };

    const result = await axios.get(`${url}/construtoras?ativo=true`, config);
    const construtoras = result.data;

    this.setState({ teste: construtoras });
    this.loadUnidades();
  }

  async loadUnidades() {
    const { teste } = this.state;
    const novo = teste.map(async construtora => {
      const unidadesFila = construtora.unidadesautonomas.map(unidade =>
        this.getUnidadeById(unidade._id)
      );
      const values = await Promise.all(unidadesFila);
      const unidades = values.map(val => val.data);
      return { ...construtora, unidadesautonomas: unidades };
    });

    const construtoras = await Promise.all(novo);

    const fixed_construtoras = await Promise.all(
      construtoras.map(async construtora => {
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
        };
        const areascomuns = construtora.areascomuns.map(area => area.id);
        const areasgerais = construtora.areasgerais.map(area => area.id);
        const areasComunsArray = await Promise.all(
          areascomuns.map(id => {
            return axios
              .get(`${url}/areatipologias?areascomun=${id}`, config)
              .then(res => res.data);
          })
        );

        const areasGeraisArray = await Promise.all(
          areasgerais.map(id => {
            return axios
              .get(`${url}/areacomumgerals?areasgerais=${id}`, config)
              .then(res => res.data);
          })
        );

        const newConstrutora = {
          ...construtora,
          areas_tipologia: areasComunsArray.reduce((total, current) => {
            return [...total, ...current];
          }, []),
          areas_gerais: areasGeraisArray.reduce((total, current) => {
            return [...total, ...current];
          }, [])
        };

        return newConstrutora;
      })
    );

    this.setState({ construtoras: fixed_construtoras });
  }

  getUnidadeById(id) {
    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
    };
    return axios.get(`${url}/unidadesautonomas/${id}`, config);
  }

  render() {
    return (
      <Content>
        <div style={{ background: '#fff' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, .1)',
              padding: 5
            }}
          >
            <h2>
              <span>Parametrização</span>
            </h2>
          </div>
          <Permissao
            codTela={this.state.codTela}
            permissaoNecessaria={[1, 2]}
            style={{ width: '90%' }}
          >
            <Row gutter={16} style={{ marginTop: '4rem' }}>
              <Col span={24}>
                <TableParametrizacao
                  codTela={this.state.codTela}
                  style={{ width: '100%' }}
                  construtoras={this.state.construtoras}
                  dispatchDados={this.dispatchDados}
                  setFieldValue={this.setFieldValue}
                  resetFields={this.cancelarEdicao}
                />
              </Col>
            </Row>
          </Permissao>
        </div>
      </Content>
    );
  }
}

export default (Parametrizacao = connect(store => {
  return {
    condominios: store.condominios.data,
    construtoras: store.construtoras.data
  };
})(Parametrizacao));
