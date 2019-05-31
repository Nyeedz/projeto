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

class TableFuncionarios extends React.Component {
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
    if (nextProps.funcionarios) {
      this.setState({ data: nextProps.funcionarios });
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
      .get(`${url}/users?funcionario=true`, config)
      .then(res => {
        const pagination = { ...this.state.pagination };
        pagination.total = res.data.length;
        this.setState({
          loading: false,
          data: res.data,
          pagination
        });
      })
      .catch(() => {
        notification.open({
          message: 'Oops!',
          description: 'Erro ao buscar dados dos funcionarios',
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
      data: this.props.funcionarios
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
                )}
              </span>
            )
          };
        })
        .filter(record => !!record)
    });
  };

  updateFuncionario = id => {
    this.props.funcionarios.map(funcionario => {
      if (funcionario._id === id) {
        this.props.setFieldValue(funcionario);
      }
      return true;
    });
  };

  deleteFuncionario = id => {
    const config = {
      headers: { Authorization: 'bearer ' + localStorage.getItem('jwt') }
    };
    axios
      .delete(`${url}/users/${id}`, config)
      .then(() => {
        notification.open({
          message: 'Ok!',
          description: 'Funcionário deletado com sucesso!'
        });
        this.props.dispatchFuncionarios();
      })
      .catch(error => {
        notification.open({
          message: 'Opss!',
          description: 'Algo deu errado ao deletar o funcionário desejado!'
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
        key: 'id' + 'nome',
        render: text => <p key={text + 'id'}>{text}</p>,
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
        key: 'sobrenome' + 'id',
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
        key: '_id',
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
                  onClick={() => this.updateFuncionario(record._id)}
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
                onConfirm={() => this.deleteFuncionario(record._id)}
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

    const { funcionarios } = this.props;

    if (funcionarios.error) {
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

export default TableFuncionarios;
