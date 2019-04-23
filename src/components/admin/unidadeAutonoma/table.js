import {
  Button,
  Divider,
  Icon,
  Popconfirm,
  Table,
  notification,
  Input,
  Tooltip
} from 'antd';
import axios from 'axios';
import React from 'react';
import { url, CODE_EDITAR } from '../../../utilities/constants';
import Permissao from '../permissoes/permissoes';

class TableUnidade extends React.Component {
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
    if (nextProps.unidade) {
      this.setState({ data: nextProps.unidade });
    }
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
      .get(`${url}/unidadesautonomas`, config)
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
      data: this.props.unidade
        .map(record => {
          const match = Object.keys(record.unidades).map(key => {
            return record.unidades[key].match(reg);
          });

          const igual = match.some(el => {
            return el !== null;
          });

          if (!igual) {
            return null;
          }

          if (searchText === '') return this.fetch();
          return {
            ...record,
            unidade: Object.keys(record.unidades).map((key, index) => {
              return (
                <p key={record.unidades[key] + index}>{record.unidades[key]}</p>
              );
            })
          };
        })
        .filter(record => !!record)
    });
  };

  updateUnidade = id => {
    this.props.unidade.map(unidade => {
      if (unidade.id === id) {
        this.props.setFieldValue(unidade);
      }
    });
    this.fetch();
  };

  deleteUnidade = id => {
    let auth = localStorage.getItem('jwt') || this.props.user.jwt;

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .delete(`${url}/unidadesautonomas/${id}`, config)
      .then(res => {
        notification.open({
          message: 'Ok!',
          description: 'Unidade deletada com sucesso!',
          icon: <Icon type="check" style={{ color: 'green' }} />
        });
        this.props.resetFields();
        this.fetch();
      })
      .catch(error => {
        notification.open({
          message: 'Opss!',
          description: 'Algo deu errado ao deletar a unidade desejado!',
          icon: <Icon type="close" style={{ color: 'red' }} />
        });
      });
  };

  onInputChange = e => {
    this.setState({ searchText: e.target.value });
  };

  render() {
    const columns = [
      {
        title: 'Unidade',
        dataIndex: 'unidades',
        key: 'unidades',
        render: text =>
          Object.keys(text).map((unidade, i) => {
            return <p key={text[unidade] + i}>{text[unidade]}</p>;
          }),
        onFilter: (value, record) => record.unidades.indexOf(value) === 0,
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
        title: 'Tipologia',
        dataIndex: 'unidade_torres',
        key: 'unidade_torres.id',
        render: text => <p>{text.nome}</p>
      },
      {
        title: 'Condomínio',
        dataIndex: 'condominios',
        key: 'condominios.id',
        render: text => <p>{text.nome}</p>
      },
      {
        title: 'Construtoras',
        dataIndex: 'construtoras',
        key: 'construtoras.id',
        render: text => <p>{text.nome}</p>
      },
      {
        title: 'Opções',
        key: 'id',
        render: (text, record) => (
          <span>
            <Permissao
              codTela={this.props.codTela}
              permissaoNecessaria={CODE_EDITAR}
              segundaOpcao="Nenhuma opção disponível!"
            >
              <Tooltip title="Editar">
                <Button
                  type="primary"
                  onClick={() => this.updateUnidade(record.id)}
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
                title="Tem certeza que deseja excluir esta unidade ?"
                onConfirm={() => this.deleteUnidade(record.id)}
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

    if (this.props.unidade.error) {
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

export default TableUnidade;
