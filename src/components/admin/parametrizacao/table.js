import React from 'react';
import {Table} from 'antd';
import Permissao from '../permissoes/permissoes';

class TableParametrizacao extends React.Component {
  state = {
    loading: true,
  };

  componentDidMount = () => {
    setTimeout (() => {
      this.setState ({
        loading: false,
      });
    }, 1000);
  };

  render () {
    const {construtoras} = this.props;

    if (construtoras.error) {
      return null;
    }

    const columns = [
      {
        title: 'Construtora',
        dataIndex: 'nome',
        key: 'id',
        render: text => <p key={text.id}>{text}</p>,
      },
      {
        title: 'Condomínio',
        dataIndex: 'condominios',
        key: 'condominios.id',
        render: text => (
          <div>
            {text.map ((condominio, i) => {
              return <p key={condominio.id + i}>{condominio.nome}</p>;
            })}
          </div>
        ),
      },
      {
        title: 'Tipologia',
        dataIndex: 'tipologias',
        key: 'tipologias.id',
        render: text => (
          <div>
            {text.map ((tipologia, i) => {
              return <p key={tipologia.id + i}>{tipologia.nome}</p>;
            })}
          </div>
        ),
      },
      {
        title: 'Unidades autônomas',
        dataIndex: 'unidades',
        key: 'unidades.id',
        render: text => (
          <div>
            {text.map ((value, i) => {
              return (
                <div key={value.id + i}>
                  {Object.keys (value.unidades).map ((key, i) => {
                    return (
                      <p key={value.unidades[key] + i + key}>
                        {value.unidades[key]}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ),
      },
      {
        title: 'Áreas comum da tipologia',
        dataIndex: 'areaGeral',
        key: 'areaGeral.id',
        render: text => (
          <div>
            {text.map ((area_geral, i) => {
              return (
                <p key={area_geral.id + i}>{area_geral.areas_gerais[i]}</p>
              );
            })}
          </div>
        ),
      },
      {
        title: 'Área comum geral',
        dataIndex: 'areaComum',
        key: 'areaComum.id',
        render: text => (
          <div>
            {text.map ((area_comum, i) => {
              return (
                <p key={area_comum.id + i}>{area_comum.areas_tipologias[i]}</p>
              );
            })}
          </div>
        ),
      },
    ];

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
            style={{width: '100%', padding: '5px'}}
          />
        </Permissao>
      </div>
    );
  }
}

export default TableParametrizacao;
