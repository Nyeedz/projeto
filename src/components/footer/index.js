import React from 'react';
import { Layout, Icon } from 'antd';

const { Footer } = Layout;

const styles = {
  centerFooter: {
    backgroundColor: '#1890FF',
    display: 'flex',
    justifyContent: 'center'
  },
  icon: {
    width: '32px',
    marginTop: '3px',
    padding: '10px'
  }
};

class Baixo extends React.Component {
  render() {
    return (
      <Footer style={styles.centerFooter}>
        <div
          style={{
            width: '460px',
            display: 'flex',
            justifyContent: 'space-around'
          }}
        >
          <span style={{ color: '#fff' }}>
            <Icon type="mail" style={styles.icon} />
            email@email.com.br
          </span>
          <span style={{ color: '#fff' }}>
            <Icon type="message" style={styles.icon} />
            0800 800 0800
          </span>
        </div>
      </Footer>
    );
  }
}

export default Baixo;
