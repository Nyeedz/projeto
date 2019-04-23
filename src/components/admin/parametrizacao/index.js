import React from 'react';
import {Col, Layout, Row} from 'antd';
import {connect} from 'react-redux';
import {fetchCondominios} from '../../../actions/condominioActions';
import {fetchConstrutoras} from '../../../actions/construtoraActions';
import TableParametrizacao from './table';
import {getCodePath} from '../../../utilities/functions';
import Permissao from '../permissoes/permissoes';

const {Content} = Layout;

class Parametrizacao extends React.Component {
  state = {
    codTela: null,
  };

  componentDidMount = () => {
    this.dispatchDados ();
    const path = this.props.history.location.pathname;
    this.setState ({
      codTela: getCodePath (path),
    });
  };

  dispatchDados = () => {
    this.props.dispatch (fetchCondominios ());
    this.props.dispatch (fetchConstrutoras ());
  };

  render () {
    return (
      <Content>
        <div style={{background: '#fff'}}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, .1)',
              padding: 5,
            }}
          >
            <h2>
              <span>Parametrização</span>
            </h2>
          </div>
          <Permissao
            codTela={this.state.codTela}
            permissaoNecessaria={[1, 2]}
            style={{width: '90%'}}
          >
            <Row gutter={16} style={{marginTop: '4rem'}}>
              <Col span={24}>
                <TableParametrizacao
                  codTela={this.state.codTela}
                  style={{width: '100%'}}
                  construtoras={this.props.construtoras}
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

export default (Parametrizacao = connect (store => {
  return {
    condominios: store.condominios.data,
    construtoras: store.construtoras.data,
  };
}) (Parametrizacao));
