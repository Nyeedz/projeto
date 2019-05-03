import React from 'react';
import { Table, Icon, Divider, notification, Button, Popconfirm } from 'antd';
import axios from 'axios';
import { url } from '../../../utilities/constants';

class TableFuncionarios extends React.Component {
  state = {
    loading: true
  };

  componentDidMount = () => {
    setTimeout(() => {
      this.setState({
        loading: false
      });
    }, 1000);
  };

  updateFuncionario = id => {
    this.props.construtoras.map((construtora, i) => {
      if (construtora.id === id) {
        this.props.setFieldValue(construtora);
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
      .then(res => {
        notification.open({
          message: 'Ok!',
          description: 'Funcionário deletado com sucesso!'
        });
        this.props.dispatchDados();
        this.props.resetFields();
      })
      .catch(error => {
        notification.open({
          message: 'Opss!',
          description: 'Algo deu errado ao deletar o funcionário desejado!'
        });
        console.log(error);
      });
  };

  render() {
    const columns = [
      {
        title: 'Nome',
        dataIndex: 'nome',
        key: 'nome',
        render: text => <a role="button">{text}</a>
      },
      {
        title: 'Condomínios',
        dataIndex: 'condominios',
        key: 'condominios.id',
        render: text => (
          <a role="button">
            {typeof text === 'object' &&
              text.map((x, i) => {
                return <p key={x.id}>{x.nome}</p>;
              })}
          </a>
        )
      },
      {
        title: 'Opções',
        key: 'id',
        render: (text, record) => (
          <span>
            <Button
              type="default"
              onClick={() => this.updateFuncionario(record.id)}
            >
              Editar
              <Icon type="edit" />
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title="Tem certeza que deseja excluir este cliente ?"
              onConfirm={() => this.deleteFuncionario(record.id)}
            >
              <Button type="danger">
                Deletar <Icon type="delete" />
              </Button>
            </Popconfirm>
          </span>
        )
      }
    ];

    const { construtoras } = this.props;

    if (construtoras.error) {
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
          dataSource={construtoras}
          loading={this.state.loading}
          style={{ width: '90%' }}
          pagination={true}
          rowKey="id"
        />
      </div>
    );
  }
}

export default TableFuncionarios;
