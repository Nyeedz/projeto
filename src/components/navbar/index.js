import React from 'react';
import { Layout, Menu, Icon, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../../actions/userActions';

const { Header } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class Navbar extends React.Component {
  state = {
    current: '1'
  };

  logout = () => {
    localStorage.clear();
    this.props.dispatch(logout());
  };

  handleClick = e => {
    this.setState({
      current: e.key
    });
  };

  render() {
    const { user } = this.props;

    return localStorage.getItem('jwt') || user.jwt ? (
      // <Layout>
      <Header className="header" style={{ zIndex: 2 }}>
        {/* <img
            src={require('../../images/logo_branco.png')}
            style={{
              float: 'left',
              width: '226px',
              height: '42px',
              margin: '11px 33px 0px -9px'
            }}
          /> */}
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[
            user.jwt ? 'admin' : 'configuracoes',
            this.state.current
          ]}
          style={{ lineHeight: '64px' }}
          onClick={this.handleClick}
        >
          {!user.jwt && (
            <Menu.Item key="login">
              <Link to="/">Login</Link>
            </Menu.Item>
          )}
          {user.jwt && user.role === 'root' && (
            <Menu.Item key="admin">
              <Link to="/admin"> Admin </Link>
            </Menu.Item>
          )}
          {user.jwt && user.role === 'authenticated' && (
            <Menu.Item key="configuracoes">
              <Link to="/configuracoes">Configurações</Link>
            </Menu.Item>
          )}
          {user.jwt && user.role === 'authenticated' && (
            <Menu.Item key="lista">
              <Link to="/lista-chamados-clientes">Lista de chamados</Link>
            </Menu.Item>
          )}
          {user.jwt && user.role === 'authenticated' && (
            <Menu.Item key="chamados">
              <Link to="/chamados">Chamados</Link>
            </Menu.Item>
          )}
          {user.jwt && user.role === 'authenticated' && user.chamados === [] && (
            <Menu.Item key="lista-chamados">
              <Link to="/lista-chamados">Lista de Chamados</Link>
            </Menu.Item>
          )}
          {/* <Menu.Item key="sobre">
            <Link to="/sobre">Sobre</Link>
          </Menu.Item> */}
          {user.jwt && (
            <SubMenu
              style={{ float: 'right' }}
              title={
                <span className="submenu-title-wrapper">
                  <Icon
                    type="user"
                    style={{
                      color: 'rgba(255, 255, 255,1)',
                      fontSize: '15px'
                    }}
                  />
                  <Icon
                    type="down"
                    style={{
                      color: 'rgba(255, 255, 255, 1)',
                      fontSize: '10px'
                    }}
                  />
                </span>
              }
            >
              <MenuItemGroup title="Perfil">
                <Menu.Item key="setting:1">
                  <Link to="/perfil">Mudar configurações da conta</Link>
                </Menu.Item>
              </MenuItemGroup>
              <MenuItemGroup title="Sair">
                <Menu.Item key="logout">
                  <Link onClick={this.logout} to="/">
                    Logout
                  </Link>
                </Menu.Item>
              </MenuItemGroup>
            </SubMenu>
          )}
        </Menu>
      </Header>
    ) : // </Layout>
    null;
  }
}

export default (Navbar = connect(store => {
  return {
    user: store.user
  };
})(Navbar));
