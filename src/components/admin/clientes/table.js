import React from 'react';
import {
  Table,
  Icon,
  Divider,
  notification,
  Button,
  Popconfirm,
  Tooltip,
  Avatar,
  Input
} from 'antd';
import axios from 'axios';
import { url, CODE_EDITAR } from '../../../utilities/constants';
import Permissao from '../permissoes/permissoes';

class TableClientes extends React.Component {
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

  componentWillReceiveProps = nexProps => {
    if (nexProps.clientes) {
      // this.fetch();
      this.setState({ data: nexProps.clientes });
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
      .get(`${url}/users?cliente=true&deleted=0`, config)
      .then(res => {
        const pagination = { ...this.state.pagination };
        pagination.total = res.data.length;
        this.setState({
          loading: false,
          data: res.data,
          pagination
        });
      })
      .catch(error => {
        notification.open({
          message: 'Oops!',
          description: 'Erro ao buscar dados dos clientes',
          icon: <Icon type="close" style={{ color: 'red' }} />
        });
        this.setState({ loading: false });
      });
  };

  onSearch = () => {
    const { searchText } = this.state;
    const reg = new RegExp(searchText, 'gi');
    this.setState({
      filterDropdownVisible: false,
      filtered: !!searchText,
      data: this.props.clientes
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

  updateClientes = id => {
    this.props.clientes.map(cliente => {
      if (cliente._id === id) {
        this.props.setFieldValue(cliente);
      }
      return true;
    });
  };

  deleteClientes = id => {
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    axios
      .put(
        `${url}/users/${id}`,
        {
          deleted: true
        },
        config
      )
      .then(res => {
        notification.open({
          message: 'Ok!',
          description: 'Cliente deletado com sucesso!',
          icon: <icon type="check" style={{ color: 'green' }} />
        });
        this.props.dispatchClientes();
      })
      .catch(error => {
        notification.open({
          message: 'Erro!',
          description: 'Erro ao deletar cliente!',
          icon: <Icon type="close" style={{ color: 'red' }} />
        });
        console.log(error);
      });
  };

  onInputChange = e => {
    this.setState({ searchText: e.target.value });
  };

  render() {
    const columns = [
      {
        title: 'Foto',
        dataIndex: 'logo',
        key: 'logo' + 'id',
        render: text => (
          <a role="button">
            {typeof text === 'string' && (
              <p key={text.id}>
                <Avatar size="large" shape="square" src={text} />
              </p>
            )}
          </a>
        )
      },
      {
        title: 'Nome',
        dataIndex: 'nome',
        key: 'id',
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
        title: 'Sobrenome',
        dataIndex: 'sobrenome',
        key: 'sobrenom' + 'id',
        render: text => <p key={text.id}>{text}</p>
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email' + 'id',
        render: text => <p key={text.id}>{text}</p>
      },
      {
        title: 'Opções',
        key: 'nome' + 'id',
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
                  style={{ fontSize: '12px' }}
                  onClick={() => this.updateClientes(record._id)}
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
                onConfirm={() => this.deleteClientes(record._id)}
              >
                <Tooltip title="Deletar">
                  <Button type="danger" style={{ fontSize: '12px' }}>
                    <Icon type="delete" />
                  </Button>
                </Tooltip>
              </Popconfirm>
            </Permissao>
          </span>
        )
      }
    ];

    const { clientes } = this.props;

    if (clientes.error) {
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

export default TableClientes;
