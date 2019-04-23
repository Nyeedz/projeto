import React from 'react';
import {Table, Input, Button, Icon} from 'antd';
import axios from 'axios';
import {url} from '../../utilities/constants';
import {connect} from 'react-redux';

class DadosCondominios extends React.Component {
  state = {
    data: [],
    pagination: {},
    condominios: [],
    loading: false,
    searchText: '',
    filtered: false,
    filterDropdownVisible: false,
  };

  componentDidMount () {
    this.fetch ();
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.user.length !== this.props.user.length) {
      this.setState ({data: nextProps.user});
    }
  };

  handleTableChange = (pagination, filters, sorter) => {
    const pager = {...this.state.pagination};
    pager.current = pagination.current;
    this.setState ({
      pagination: pager,
    });
    this.fetch ({
      results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };

  fetch = () => {
    this.setState ({loading: true});

    let auth = localStorage.getItem ('jwt') || this.props.user.jwt;
    const config = {
      headers: {Authorization: `Bearer ${auth}`},
    };

    let id = localStorage.getItem ('id') || this.props.user.id;

    axios
      .get (`${url}/users/${id}`, config)
      .then (res => {
        const pagination = {...this.state.pagination};
        pagination.total = res.data.length;
        this.setState ({
          condominios: res.data.condominios,
          loading: false,
          pagination,
        });
        this.getCondominios ();
      })
      .catch (err => console.log (err.message));
  };

  getCondominios = () => {
    let auth = localStorage.getItem ('jwt') || this.props.user.jwt;
    const config = {
      headers: {Authorization: `Bearer ${auth}`},
    };
    if (this.state.condominios.length >= 1) {
      this.state.condominios.map ((condominios, i) => {
        return axios
          .get (`${url}/condominios/${condominios._id}`, config)
          .then (res => {
            const pagination = {...this.state.pagination};
            const data = this.state.data;
            data.push (res.data);
            pagination.total = 5;
            this.setState ({
              data: data,
              pagination,
              loading: false,
            });
          });
      });
    }
  };

  onSearch = () => {
    const {searchText} = this.state;
    const reg = new RegExp (searchText, 'gi');
    this.setState ({
      filterDropdownVisible: false,
      filtered: !!searchText,
      data: this.props.user.condominios
        .map (record => {
          const match = record.nome.match (reg);

          if (!match) {
            return null;
          }
          if (searchText === '') return this.fetch ();
          return {
            ...record,
            nome: (
              <span>
                {record.nome.toLowerCase () === searchText.toLowerCase ()
                  ? <span key={record._id} className="highlight">
                      {record.nome}
                    </span>
                  : record.nome // eslint-disable-line
                }
              </span>
            ),
          };
        })
        .filter (record => !!record),
    });
  };

  onInputChange = e => {
    this.setState ({searchText: e.target.value});
  };

  render () {
    const columns = [
      {
        title: 'Condomínios',
        dataIndex: 'nome',
        key: 'nome',
        render: text => <p key={text.id + text}>{text}</p>,
        onFilter: (value, record) => record.nome.indexOf (value) === 0,
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => (this.searchInput = ele)}
              placeholder="Pesquisar nome"
              value={this.state.searchText}
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
            />
            <Button type="primary" onClick={this.onSearch}>Search</Button>
          </div>
        ),
        filterIcon: (
          <Icon
            type="search"
            style={{color: this.state.filtered ? '#108ee9' : '#aaa'}}
          />
        ),
        filterDropdownVisible: this.state.filterDropdownVisible,
        onFilterDropdownVisibleChange: visible => {
          this.setState (
            {
              filterDropdownVisible: visible,
            },
            () => this.searchInput && this.searchInput.focus ()
          );
        },
      },
      {
        title: 'Ativo',
        dataIndex: 'ativo',
        key: 'ativo',
        render: text => <p>{text ? 'Ativo' : 'Intivo'}</p>,
      },
    ];

    return (
      <Table
        columns={columns}
        rowKey={(record, value) => record.id + value}
        dataSource={this.state.data}
        pagination={this.state.pagination}
        loading={this.state.loading}
        onChange={this.handleTableChange}
        style={{width: '90%', maxWidth: '100%'}}
      />
    );
  }
}

export default (DadosCondominios = connect (store => {
  return {
    user: store.user,
  };
}) (DadosCondominios));
