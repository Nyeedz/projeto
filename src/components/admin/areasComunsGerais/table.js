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

class TableAreaGeral extends React.Component {
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
      .get(`${url}/areasgerais`, config)
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
      data: this.props.areasGerais
        .map(record => {
          const match = Object.keys(record.areas_gerais).map(key => {
            return record.areas_gerais[key].match(reg);
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
            unidade: Object.keys(record.areas_gerais).map((key, index) => {
              return (
                <p key={record.areas_gerais[key] + index}>
                  {record.areas_gerais[key]}
                </p>
              );
            })
          };
        })
        .filter(record => !!record)
    });
  };

  updateAreasGerais = id => {
    this.props.areasGerais.map(areasGerais => {
      if (areasGerais.id === id) {
        this.props.setFieldValue(areasGerais);
      }
    });
    this.fetch();
  };

  deleteAreasGerais = id => {
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    axios
      .delete(`${url}/areasgerais/${id}`, config)
      .then(res => {
        notification.open({
          message: 'Ok!',
          description: 'Áreas gerais deletada com sucesso!',
          icon: <icon type="check" style={{ color: 'green' }} />
        });
        this.props.dispatchAreasGerais();
      })
      .catch(error => {
        notification.open({
          message: 'Erro!',
          description: 'Erro ao deletar a áreas gerais!',
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
        title: 'Áreas gerais',
        dataIndex: 'areas_gerais',
        key: 'areas_gerais',
        render: text =>
          Object.keys(text).map((areas_gerais, i) => {
            return <p key={text[areas_gerais] + i}>{text[areas_gerais]}</p>;
          }),
        onFilter: (value, record) => record.areas_gerais.indexOf(value) === 0,
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
        title: 'Condomínio',
        dataIndex: 'condominio',
        key: 'condominio.id',
        render: text => <p key={text.id}>{text.nome}</p>
      },
      {
        title: 'Construtora',
        dataIndex: 'construtoras',
        key: 'construtoras.id',
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
                  onClick={() => this.updateAreasGerais(record.id)}
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
                title="Tem certeza que deseja excluir esta área comum geral ?"
                onConfirm={() => this.deleteAreasGerais(record.id)}
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

    const { areasGerais } = this.props;

    if (areasGerais.error) {
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
          dataSource={areasGerais}
          loading={this.state.loading}
          style={{ width: '95%' }}
          pagination={true}
          rowKey="id"
        />
      </div>
    );
  }
}

export default TableAreaGeral;
