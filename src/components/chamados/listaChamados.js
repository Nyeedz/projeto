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
import { connect } from 'react-redux';
import { selectChamado } from '../../actions/chamadosActions';
import { saveUser, getMe } from '../../actions/userActions';

class ListaChamadosClientes extends React.Component {
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
      .get(`${url}/users/me`, config)
      .then(res => {
        const pagination = { ...this.state.pagination };
        pagination.total = res.data.chamados.length;
        this.setState({
          loading: false,
          data: res.data.chamados,
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
      data: this.state.data
        .map(record => {
          const match = record._id.match(reg);
          if (!match) {
            return null;
          }
          if (searchText === '') return this.fetch();
          return {
            ...record,
            nome: (
              <span>
                {record._id.toLowerCase() === searchText.toLowerCase() ? (
                  <span key={record._id + record.contato} className="highlight">
                    {record._id}
                  </span>
                ) : (
                  record._id
                ) // eslint-disable-line
                }
              </span>
            )
          };
        })
        .filter(record => !!record)
    });
  };

  updateChamados = async chamado => {
    this.props.history.push(`/chamado/${chamado._id}`);
  };

  onInputChange = e => {
    this.setState({ searchText: e.target.value });
  };

  render() {
    const status = ['Abertura chamado', 'Análise técnica', 'Parecer técnico'];
    const columns = [
      {
        title: 'Código chamado',
        dataIndex: '_id',
        key: '_id',
        render: text => <p key={text}>{text}</p>,
        onFilter: (value, record) => record._id.indexOf(value) === 0,
        sorter: (a, b) => b._id.length - a._id.length,
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
        title: 'Data de abertura ',
        dataIndex: 'data_abertura',
        key: 'data_abertura' + '_id',
        render: text => <p key={text}>{moment(text).format('LLLL')}</p>
      },
      // {
      //   title: 'Condomínio',
      //   dataIndex: 'condominio',
      //   key: 'condominio',
      //   render: condominio => {
      //     console.log(condominio, 'adasdasd');
      //   }
      // },
      {
        title: 'Criado em',
        dataIndex: 'createdAt',
        id: 'createdAt' + '_id',
        render: text => <p key={text}>{moment(text).format('LLLL')}</p>
      },
      {
        title: 'Status',
        dataIndex: 'status',
        id: 'status' + '_id',
        render: (text, i) => <p key={text + i}>{status[text]}</p>
      },
      {
        title: 'Opções',
        key: 'id' + 'condominio.id' + 'data_abertura',
        render: record => (
          <span>
            <Tooltip title="Editar">
              <Button
                type="primary"
                onClick={() => this.updateChamados(record)}
              >
                <Icon type="edit" />
              </Button>
            </Tooltip>

            {/* <Divider type="vertical" />
            <Popconfirm
              title="Está ação irá excluir todos os dados conectados a esta construtora, tem certeza que deseja excluir esta construtora ?"
              onConfirm={() => this.deleteConstrutora(record.id)}
            >
              <Tooltip title="Deletar">
                <Button type="danger">
                  <Icon type="delete" />
                </Button>
              </Tooltip>
            </Popconfirm> */}
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
          rowKey={record => record._id + record.garantia}
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

export default (ListaChamadosClientes = connect(store => {
  return {
    chamados: store.chamados,
    user: store.user
  };
})(ListaChamadosClientes));
