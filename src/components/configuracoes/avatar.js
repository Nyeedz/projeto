import React from 'react';
import { Modal, Button } from 'antd';
import { connect } from 'react-redux';
import EditAvatar from './modal';

class ModalAvatar extends React.Component {
  state = {
    visible: false,
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };

  render() {
    const { visible } = this.state;
    return (
      <div style={{ marginTop: '5rem' }}>
        {this.props.imagem !== null ? (
          <img
            src={this.props.imagem}
            alt={this.props.username}
            style={{
              width: '132px',
              height: '132px',
              border: '1px solid rgba(0, 0, 0, .2)',
              padding: '5px'
            }}
          />
        ) : (
          <img
            src={
              this.props.user.logo
                ? this.props.user.logo
                : 'https://www.contentchampion.com/wp-content/uploads/2013/11/avatar-placeholder.png'
            }
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
            Trocar avatar
          </Button>
        </div>
        <Modal
          title="Editar Imagem de perfil"
          visible={visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <EditAvatar
            imagem={this.props.user.logo}
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
    user: store.user
  };
})(ModalAvatar));
