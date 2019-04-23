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

class TableAreaComum extends React.Component {
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
    if (nextProps.areasComuns.length !== this.props.areasComuns.length) {
      this.setState({ data: nextProps.areasComuns });
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
      .get(`${url}/areascomuns`, config)
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
      data: this.props.areasComuns
        .map(record => {
          const match = Object.keys(record.areas_tipologias).map(key => {
            return record.areas_tipologias[key].match(reg);
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
            unidade: Object.keys(record.areas_tipologias).map((key, index) => {
              return (
                <p key={record.areas_tipologias[key] + index}>
                  {record.areas_tipologias[key]}
                </p>
              );
            })
          };
        })
        .filter(record => !!record)
    });
  };

  updateAreasComuns = id => {
    this.props.areasComuns.map((areasComuns, i) => {
      if (areasComuns.id === id) this.props.setFieldValue(areasComuns);
    });
  };

  deleteAreasComuns = id => {
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };

    axios
      .put(
        `${url}/areascomuns/${id}`,
        {
          deleted: true
        },
        config
      )
      .then(res => {
        notification.open({
          message: 'Ok!',
          description: 'Área comum deletada com sucesso!',
          icon: <icon type="check" style={{ color: 'green' }} />
        });
        this.props.dispatchAreasComuns();
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
        title: 'Áreas das tipologias',
        dataIndex: 'areas_tipologias',
        key: 'areas_tipologias',
        render: text =>
          Object.keys(text).map((areas_tipologias, i) => {
            return (
              <p key={text[areas_tipologias] + i}>{text[areas_tipologias]}</p>
            );
          }),
        onFilter: (value, record) =>
          record.areas_tipologias.indexOf(value) === 0,
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
        title: 'Tipologia',
        dataIndex: 'torre',
        key: 'torre.id',
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
                  onClick={() => this.updateAreasComuns(record.id)}
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
                title="Tem certeza que deseja excluir esta área comum da tipolofia ?"
                onConfirm={() => this.deleteAreasComuns(record.id)}
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

    const { areasComuns } = this.props;

    if (areasComuns.error) {
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
          dataSource={areasComuns}
          pagination={this.state.pagination}
          loading={this.state.loading}
          onChange={this.handleTableChange}
          pagination={true}
          style={{ width: '90%', maxWidth: '100%' }}
        />
      </div>
    );
  }
}

export default TableAreaComum;
