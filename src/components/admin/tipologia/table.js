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
import moment from 'moment';
import './style.css';

class TableTipologia extends React.Component {
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
    if (nextProps.torre) this.setState({ data: nextProps.torre });
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
      .get(`${url}/tipologias`, config)
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
      data: this.props.torre
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

  updateTorre = id => {
    this.props.torre.map(torre => {
      if (torre.id === id) {
        return this.props.setFieldValue(torre);
      }
    });
    this.fetch();
  };

  deleteTorre = id => {
    let auth = localStorage.getItem('jwt') || this.props.user.jwt;

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .delete(`${url}/tipologias/${id}`, config)
      .then(res => {
        notification.open({
          message: 'Ok!',
          description: 'Tipologia deletada com sucesso!',
          icon: <Icon type="check" style={{ color: 'green' }} />
        });
        this.props.resetFields();
        this.fetch();
      })
      .catch(error => {
        notification.open({
          message: 'Opss!',
          description: 'Algo deu errado ao deletar a tipologia desejado!',
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
        title: 'Nome',
        dataIndex: 'nome',
        key: 'nome',
        render: (text, record) => <p key={record + text}>{text}</p>,
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
        title: 'Garantia',
        dataIdex: 'validade',
        key: 'validade',
        render: (text, record) => (
          <p key={record.id}>
            {moment(text.validade)
              .format('DD/MM/YYYY')
              .toString()}
          </p>
        )
      },
      {
        title: 'Condomínio',
        dataIndex: 'condominios',
        key: 'condominios.id',
        render: (text, i) => <p key={text + i}>{text ? text.nome : null}</p>
      },
      {
        title: 'Construtora',
        dataIndex: 'construtora',
        key: 'construtora.id',
        render: (text, i) => <p key={text + i}>{text ? text.nome : null}</p>
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
                  onClick={() => this.updateTorre(record.id)}
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
                title="Tem certeza que deseja excluir esta tipologia ?"
                onConfirm={() => this.deleteTorre(record.id)}
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

    if (this.props.torre.error) {
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

export default TableTipologia;
