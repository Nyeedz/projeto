import React from 'react';
import {
  Table,
  Icon,
  Divider,
  notification,
  Button,
  Popconfirm,
  Input,
  Tooltip
} from 'antd';
import axios from 'axios';
import { url, CODE_EDITAR } from '../../../utilities/constants';
import Permissao from '../permissoes/permissoes';

class TableConstrutoras extends React.Component {
  state = {
    data: [],
    pagination: {},
    loading: false,
    searchText: '',
    filtered: false,
    filterDropdownVisible: false
  };

  componentDidMount = () => {
    this.fetch();
  };

  componentWillReceiveProps = nextProps => {
    if (nextProps.construtoras) this.setState({ data: nextProps.construtoras });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.fetch({
      results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    });
  };

  fetch = () => {
    this.setState({ loading: true });
    let auth = localStorage.getItem('jwt') || this.props.user.jwt;

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/construtoras`, config)
      .then(res => {
        const pagination = { ...this.state.pagination };
        // Read total count from server
        // pagination.total = data.totalCount;
        pagination.total = res.data.length;
        this.setState({
          loading: false,
          data: res.data,
          pagination
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  onSearch = () => {
    const { searchText } = this.state;
    const reg = new RegExp(searchText, 'gi');
    this.setState({
      filterDropdownVisible: false,
      filtered: !!searchText,
      data: this.props.construtoras
        .map(record => {
          const match = record.nome.match(reg);
          if (!match) {
            return null;
          }
          if (searchText === '') return this.fetch();
          return {
            ...record,
            nome: (
              <span>
                {record.nome.toLowerCase() === searchText.toLowerCase() ? (
                  <span key={record._id} className="highlight">
                    {record.nome}
                  </span>
                ) : (
                  record.nome
                ) // eslint-disable-line
                }
              </span>
            )
          };
        })
        .filter(record => !!record)
    });
  };

  updateConstrutora = id => {
    this.props.construtoras.map(construtora => {
      if (construtora.id === id) {
        return this.props.setFieldValue(construtora);
      }
    });
    this.fetch();
  };

  deleteConstrutora = id => {
    let auth = localStorage.getItem('jwt') || this.props.user.jwt;

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    axios.get(`${url}/construtoras/${id}`, config).then(res => {
      res.data.condominios.map(condominio => {
        return axios
          .delete(`${url}/condominios/${condominio._id}`, config)
          .then(() => {})
          .catch(error => {
            console.log(error);
          });
      });

      res.data.areascomuns.map(areacomun => {
        return axios
          .delete(`${url}/areascomuns/${areacomun._id}`, config)
          .then()
          .catch(error => {
            console.log(error);
          });
      });

      res.data.areasgerais.map(areageral => {
        return axios
          .delete(`${url}/areasgerais/${areageral._id}`, config)
          .then()
          .catch(error => {
            console.log(error);
          });
      });

      res.data.garantias.map(garantia => {
        return axios
          .delete(`${url}/garantias/${garantia._id}`, config)
          .then()
          .catch(error => {
            console.log(error);
          });
      });

      res.data.pesquisasatisfacaos.map(pesquisa => {
        return axios
          .delete(`${url}/pesquisasatisfacaos/${pesquisa._id}`, config)
          .then()
          .catch(error => {
            console.log(error);
          });
      });

      res.data.tipologias.map(tipologia => {
        return axios
          .delete(`${url}/tipologias/${tipologia._id}`, config)
          .then()
          .catch(error => {
            console.log(error);
          });
      });

      res.data.unidadesautonomas.map(unidade => {
        return axios
          .delete(`${url}/unidadesautonomas/${unidade._id}`, config)
          .then()
          .catch(error => {
            console.log(error);
          });
      });

      axios
        .delete(`${url}/construtoras/${id}`, config)
        .then(() => {
          notification.open({
            message: 'Ok!',
            description: 'Construtora deletada com sucesso!',
            icon: <Icon type="check" style={{ color: 'green' }} />
          });
          this.props.dispatchConstrutoras();
          this.props.resetFields();
          this.fetch();
        })
        .catch(error => {
          console.log(error);
          notification.open({
            message: 'Opss!',
            description: 'Algo deu errado ao deletar a construtora desejada!',
            icon: <Icon type="close" style={{ color: 'red' }} />
          });
        });
    });
  };

  onInputChange = e => {
    this.setState({ searchText: e.target.value });
  };

  render() {
    const columns = [
      {
        title: 'Nome',
        dataIndex: 'nome',
        key: 'nome',
        render: text => <p key={text.id}>{text}</p>,
        onFilter: (value, record) => record.nome.indexOf(value) === 0,
        sorter: (a, b) => b.nome.length - a.nome.length,
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => (this.searchInput = ele)}
              placeholder="Pesquisar"
              value={this.state.searchText}
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
            />
            <Button type="primary" onClick={this.onSearch}>
              Pesquisar
            </Button>
          </div>
        ),
        filterIcon: (
          <Icon
            type="search"
            style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }}
          />
        ),
        filterDropdownVisible: this.state.filterDropdownVisible,
        onFilterDropdownVisibleChange: visible => {
          this.setState(
            {
              filterDropdownVisible: visible
            },
            () => this.searchInput && this.searchInput.focus()
          );
        }
      },
      {
        title: 'Ativo',
        dataIndex: 'ativo',
        key: 'ativo',
        render: text => <p>{text ? 'Ativo' : 'Inativo'}</p>
      },
      {
        title: 'Opções',
        key: 'id',
        render: record => (
          <span>
            <Permissao
              codTela={this.props.codTela}
              permissaoNecessaria={CODE_EDITAR}
              segundaOpcao="Nenhuma opção disponível!"
            >
              <Tooltip title="Editar">
                <Button
                  type="primary"
                  onClick={() => this.updateConstrutora(record.id)}
                >
                  <Icon type="edit" />
                </Button>
              </Tooltip>
            </Permissao>

            <Divider type="vertical" />
            <Permissao
              codTela={this.props.codTela}
              permissaoNecessaria={CODE_EDITAR}
            >
              <Popconfirm
                title="Está ação irá excluir todos os dados conectados a esta construtora, tem certeza que deseja excluir esta construtora ?"
                onConfirm={() => this.deleteConstrutora(record.id)}
              >
                <Tooltip title="Deletar">
                  <Button type="danger">
                    <Icon type="delete" />
                  </Button>
                </Tooltip>
              </Popconfirm>
            </Permissao>
          </span>
        )
      }
    ];

    if (this.props.construtoras.error) {
      return null;
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Table
          columns={columns}
          rowKey="id"
          dataSource={this.state.data}
          pagination={this.state.pagination}
          loading={this.state.loading}
          onChange={this.handleTableChange}
          style={{ width: '90%', maxWidth: '100%' }}
        />
      </div>
    );
  }
}

export default TableConstrutoras;
