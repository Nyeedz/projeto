import { Button, Icon, Table, Tooltip } from 'antd';
import * as moment from 'moment';
import React from 'react';

const { Column } = Table;

export class ChamadosAdminTable extends React.Component {
  status = ['Abertura chamado', 'Análise técnica', 'Parecer técnico'];

  render() {
    const { chamados, selectChamado } = this.props;
    return (
      <Table dataSource={chamados}>
        <Column title="Código chamado" dataIndex="_id" key="_id" />
        <Column
          title="Data de abertura"
          dataIndex="data_abertura"
          key={'data_abertura' + '_id'}
          render={text => <span key={text}>{moment(text).format('LLL')}</span>}
        />
        <Column
          title="Data de visita"
          dataIndex="data_visita"
          key={'data_visita' + '_id'}
          render={text => <span key={text}>{moment(text).format('LLL')}</span>}
        />
        <Column
          title="Status"
          dataIndex="status"
          key={'status' + '_id'}
          render={(text, i) => <span key={text + i}>{this.status[0]}</span>}
        />
        <Column
          title="Opções"
          key={'id' + 'condominio.id' + 'data_abertura'}
          render={record => (
            <span>
              <Tooltip title="Analise">
                <Button
                  type="primary"
                  onClick={() => selectChamado(record)}
                >
                  <Icon type="edit" />
                </Button>
              </Tooltip>
            </span>
          )}
        />
      </Table>
    );
  }
}
