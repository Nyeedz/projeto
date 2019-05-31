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
import moment from 'moment';
import axios from 'axios';
import { url, CODE_EDITAR } from '../../../utilities/constants';
import Permissao from '../permissoes/permissoes';
import './table.css';

class TableGarantia extends React.Component {
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
    if (nextProps.garantias) {
      // this.fetch();
      this.setState({ data: nextProps.garantias });
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
      .get(`${url}/garantias`, config)
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
      data: this.props.garantias
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

  updateGarantia = id => {
    this.props.garantias.map(garantia => {
      if (garantia.id === id) return this.props.setFieldValue(garantia);
      return true;
    });
    this.fetch();
  };

  deleteGarantia = id => {
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    axios
      .delete(`${url}/garantias/${id}`, config)
      .then(res => {
        notification.open({
          message: 'Ok!',
          description: 'Garantia deletada com sucesso!',
          icon: <icon type="check" style={{ color: 'green' }} />
        });
        this.props.dispatchGarantias();
      })
      .catch(error => {
        notification.open({
          message: 'Erro!',
          description: 'Erro ao deletar a garantia !',
          icon: <Icon type="close" style={{ color: 'red' }} />
        });
        console.log(error);
      });
  };

  onInputChange = e => {
    this.setState({ searchText: e.target.value });
  };

  render() {
    const prefix = {
      d: 'dia(s)',
      month: 'mes(es)',
      y: 'ano(s)'
    };

    const columns = [
      {
        title: 'Itens',
        dataIndex: 'nome',
        key: 'nome',
        render: text => <p key={text.id}>{text}</p>,
        onFilter: (value, record) => record.nome.indexOf(value) === 0,
        sorter: (a, b) => b.nome.length - a.nome.length,
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => (this.searchInput = ele)}
              placeholder="Pesquisar nome"
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
        title: 'Itens secundários',
        dataIndex: 'subitem',
        key: 'item_secundario',
        render: text =>
          Object.keys(text).map((x, i) => {
            return <p key={text[x] + i}>{text[x].subitem}</p>;
          })
      },
      {
        title: 'Construtora',
        dataIndex: 'construtora',
        key: 'construtora.id',
        render: text => <p key={text.id}>{text.nome}</p>
      },
      {
        title: 'Condomínio',
        dataIndex: 'condominio',
        key: 'condominio.id',
        render: text => <p key={text.id}>{text.nome}</p>
      },
      // {
      //   title: 'Tipologia',
      //   dataIndex: 'tipologia',
      //   key: 'tipologia.id',
      //   render: text => <p key={text.id}>{text.nome}</p>
      // },
      {
        title: 'Tempo garantia',
        dataIndex: 'subitem',
        key: 'tempo_garantia',
        render: text =>
          Object.keys(text).map((x, i) => {
            return (
              <p key={text[x] + i}>
                {text[x].tempo_garantia || 'ato da entrega'} {prefix[text[x].unidade_garantia]}
              </p>
            );
          })
      },
      {
        title: 'Início',
        dataIndex: 'subitem',
        key: 'data_inicio',
        render: text =>
          Object.keys(text).map((x, i) => {
            return <p key={text[x] + i}>{text[x].data_inicio}</p>;
          })
      },
      {
        title: 'Fim',
        dataIndex: 'subitem',
        key: 'fim',
        render: text =>
          Object.keys(text).map((x, i) => {
            return (
              <p key={text[x] + i}>
                {!text[x].tempo_garantia ? '--' : moment(text[x].data_inicio, 'DD/MM/YYYY')
                  .add(text[x].tempo_garantia, text[x].unidade_garantia)
                  .format('DD/MM/YYYY')
                  .toString()}
              </p>
            );
          })
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
                  style={{ fontSize: '12px' }}
                  onClick={() => this.updateGarantia(record.id)}
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
                onConfirm={() => this.deleteGarantia(record.id)}
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

    const { garantias } = this.props;

    if (garantias.error) {
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
          dataSource={garantias}
          loading={this.state.loading}
          style={{ width: '100%', padding: '5px' }}
          pagination={true}
          rowKey="id"
        />
      </div>
    );
  }
}

export default TableGarantia;
