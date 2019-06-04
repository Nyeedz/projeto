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
import { url } from '../../utilities/constants';
import moment from 'moment';

export default class ListaChamadosClientes extends React.Component {
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
    if (nextProps.chamados) this.setState({ data: nextProps.construtoras });
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
      .get(`${url}/chamados`, config)
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
    this.props.chamados.map(chamado => {
      if (chamado.id === id) {
        return this.props.setFieldValue(chamado);
      }
    });
    this.fetch();
  };

  onInputChange = e => {
    this.setState({ searchText: e.target.value });
  };

  render() {
    const columns = [
      {
        title: 'Data de abertura ',
        dataIndex: 'data_abertura',
        key: 'data_abertura' + 'id',
        render: text => <p key={text}>{moment(text).format('LLLL')}</p>,
        onFilter: (value, record) => record.nome.indexOf(value) === 0,
        sorter: (a, b) => b.nome.length - a.nome.length,
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => (this.searchInput = ele)}
              placeholder="Data de abertura"
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
        title: 'Problema principal',
        dataIndex: 'tipologia',
        id: 'tipologia._id',
        render: text => <p key={text._id}>{text.nome}</p>
      },
      {
        title: 'Subitem do problema',
        dataIndex: 'garantia',
        id: 'garantia',
        render: text => <p key={text._id}>{text.nome}</p>
      },
      {
        title: 'Status',
        dataIndex: 'status',
        id: 'status' + '_id',
        render: (text, i) => <p key={text + i}>{text}</p>
      },
      {
        title: 'Opções',
        key: 'id',
        render: record => (
          <span>
            <Tooltip title="Editar">
              <Button
                type="primary"
                onClick={() => this.updateConstrutora(record.id)}
              >
                <Icon type="edit" />
              </Button>
            </Tooltip>

            <Divider type="vertical" />
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
          </span>
        )
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
