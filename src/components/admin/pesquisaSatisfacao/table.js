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

class TablePesquisa extends React.Component {
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
    if (nexProps.perguntas) this.setState({ data: nexProps.perguntas });
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
      .get(`${url}/pesquisasatisfacaos`, config)
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
      data: this.props.perguntas
        .map(record => {
          const match = Object.keys(record.perguntas).map(key => {
            return record.perguntas[key].match(reg);
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
            unidade: Object.keys(record.perguntas).map((key, index) => {
              return (
                <p key={record.perguntas[key] + index}>
                  {record.perguntas[key]}
                </p>
              );
            })
          };
        })
        .filter(record => !!record)
    });
  };

  updatePerguntas = id => {
    this.props.perguntas.map(pergunta => {
      if (pergunta.id === id) {
        this.props.setFieldValue(pergunta);
      }
      return true;
    });
  };

  deletePerguntas = id => {
    const config = {
      headers: { Authorization: 'bearer ' + localStorage.getItem('jwt') }
    };

    axios
      .delete(`${url}/pesquisasatisfacaos/${id}`, config)
      .then(res => {
        notification.open({
          message: 'Ok!',
          description: 'Pergunta deletada com sucesso!',
          icon: <Icon type="check" style={{ color: 'green' }} />
        });
        this.props.resetFields();
        this.props.getPerguntas();
        this.fetch();
      })
      .catch(error => {
        notification.open({
          message: 'Erro!',
          description: 'Erro ao deletar pergunta!',
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
        title: 'Perguntas',
        dataIndex: 'perguntas',
        key: 'perguntas',
        render: text =>
          Object.keys(text).map((pergunta, i) => {
            return <p key={text[pergunta] + i}>{text[pergunta]}</p>;
          }),
        onFilter: (value, record) => record.perguntas.indexOf(value) === 0,
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => (this.searchInput = ele)}
              placeholder="Pesquisar pergunta"
              value={this.state.searchText}
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
            />
            <Button type="primary" onClick={this.onSearch}>
              Search
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
        title: 'Construtora',
        dataIndex: 'construtoras',
        key: 'construtoras',
        render: text => <p key={text.id}>{text.nome}</p>
      },
      {
        title: 'Opções',
        key: 'nome',
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
                  onClick={() => this.updatePerguntas(record.id)}
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
                title="Tem certeza que deseja excluir esta pergunta ?"
                onConfirm={() => this.deletePerguntas(record.id)}
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

export default TablePesquisa;
