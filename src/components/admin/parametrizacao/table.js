import React from 'react';
import { Table } from 'antd';
import Permissao from '../permissoes/permissoes';
import * as axios from 'axios';
import { url } from '../../../utilities/constants';

class TableParametrizacao extends React.Component {
  state = {
    loading: true
  };

  componentDidMount = () => {
    setTimeout(() => {
      this.setState({
        loading: false
      });
    }, 1000);
  };

  render() {
    const { construtoras } = this.props;

    if (construtoras.error) {
      return null;
    }

    let auth = localStorage.getItem('jwt');
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    const columns = [
      {
        title: 'Construtora',
        dataIndex: 'nome',
        key: 'id',
        render: text => <p key={text.id}>{text}</p>
      },
      {
        title: 'Condomínio',
        dataIndex: 'condominios',
        key: 'condominios.id',
        render: text => (
          <div>
            {text.map((condominio, i) => {
              return <p key={condominio.id + i}>{condominio.nome}</p>;
            })}
          </div>
        )
      },
      {
        title: 'Tipologia',
        dataIndex: 'tipologias',
        key: 'tipologias.id',
        render: text => (
          <div>
            {text.map((tipologia, i) => {
              return <p key={tipologia.id + i}>{tipologia.nome}</p>;
            })}
          </div>
        )
      },
      {
        title: 'Unidades autônomas',
        dataIndex: 'unidadesautonomas',
        key: 'unidadesautonomas.id',
        render: text => (
          <div>
            {text.map(unidadeAutonoma => {
              if (unidadeAutonoma.unidades) {
                return unidadeAutonoma.unidades.map((unidade, i) => {
                  return <p key={unidade._id + i}>{unidade.nome}</p>;
                });
              } else {
                return <p key="placeholder">...</p>;
              }
            })}
          </div>
        )
      },
      {
        title: 'Áreas comum da tipologia',
        dataIndex: 'areas_tipologia',
        key: 'areas_tipologia.id',
        render: text => {
          return text.map(val => {
            return <p key={val.id}>{val.nome}</p>;
          });
        }
      },
      {
        title: 'Área comum geral',
        dataIndex: 'areas_gerais',
        key: 'areas_gerais.id',
        render: text => {
          return text.map(val => {
            return <p key={val.id}>{val.nome}</p>;
          });
        }
      }
    ];

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Permissao
          codTela={this.props.codTela}
          permissaoNecessaria={[1, 2]}
          segundaOpcao="Nenhuma opção disponível!"
        >
          <Table
            columns={columns}
            dataSource={construtoras}
            loading={this.state.loading}
            pagination={true}
            rowKey="id"
            style={{ width: '100%', padding: '5px' }}
          />
        </Permissao>
      </div>
    );
  }
}

export default TableParametrizacao;
