import React from 'react';
import { Modal, Button } from 'antd';
import { connect } from 'react-redux';
import EditAvatar from './modal';
import placeholder from '../../../images/avatar-placeholder.png';

class ModalAvatar extends React.Component {
  state = {
    visible: false,
    confirmLoading: false
  };
  showModal = () => {
    this.setState({
      visible: true
    });
  };
  handleOk = () => {
    this.setState({
      ModalText: 'The modal will be closed after two seconds',
      confirmLoading: true
    });
    setTimeout(() => {
      this.setState({
        visible: false,
        confirmLoading: false
      });
    }, 2000);
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };
  render() {
    const { visible } = this.state;
    return (
      <div>
        {this.props.imagem ? (
          <img
            src={this.props.imagem}
            alt="Avatar"
            style={{
              width: '132px',
              height: '132px',
              border: '1px solid rgba(0, 0, 0, .2)',
              padding: '5px'
            }}
          />
        ) : (
          <img
            src={this.state.imagem ? this.state.imagem : placeholder}
            alt="Avatar"
            style={{
              width: '132px',
              height: '132px',
              border: '1px solid rgba(0, 0, 0, .2)',
              padding: '5px'
            }}
          />
        )}
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Button type="primary" onClick={this.showModal}>
            Foto
          </Button>
        </div>
        <Modal
          title="Editar Imagem de perfil"
          visible={visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <EditAvatar
            imagem={this.state.imagem}
            saveImage={this.props.saveImage}
            fechar={this.handleCancel}
          />
        </Modal>
      </div>
    );
  }
}

export default (ModalAvatar = connect(store => {
  return {
    clientes: store.clientes
  };
})(ModalAvatar));
