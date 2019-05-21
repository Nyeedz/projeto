import React from 'react';
import { Route, Link } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import { connect } from 'react-redux';
import Construtora from './construtoras/';
import Condominios from './condominios/';
import Garantia from './garantia/';
import Funcionarios from './funcionario';
import Clientes from './clientes/';
import Pesquisa from './pesquisaSatisfacao';
import GraficosTotal from './graficos';
import Parametrização from './parametrizacao';
import Tipologia from './tipologia';
import Unidade from './unidadeAutonoma';
import AreasGerais from './areasComunsGerais';
import AreasComuns from './areasComunsTipologia';
import Permissoes from './permissoes';
import Chamados from './chamados';
import Teste from './teste';

import './style.css';

const { Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class Admin extends React.Component {
  isPermitido = (codTela, permissaoNecessaria = [1, 2]) => {
    const permissoes = this.props.permissoes;

    if (
      codTela == null ||
      permissoes == null ||
      permissaoNecessaria == null ||
      typeof codTela !== 'number' ||
      (typeof permissaoNecessaria !== 'number' &&
        typeof permissaoNecessaria !== 'object')
    ) {
      return false;
    }

    const permissaoUsuario = permissoes[codTela]
      ? permissoes[codTela].status
      : 0;

    if (typeof permissaoNecessaria === 'object') {
      return permissaoNecessaria.indexOf(permissaoUsuario) !== -1;
    }
    return permissaoUsuario === parseInt(permissaoNecessaria);
  };

  render() {
    return (
      <Layout>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          onCollapse={(collapsed, type) => {
            console.log(collapsed, type);
          }}
          width={300}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultOpenKeys={['sub1']}>
            <SubMenu key="sub1" title={<span>Cadastro Geral</span>}>
              <MenuItemGroup key="g1">
                {this.isPermitido(0) ? (
                  <Menu.Item key="1">
                    <Link to="/admin/construtora">Construtora</Link>
                  </Menu.Item>
                ) : null}

                {this.isPermitido(1) ? (
                  <Menu.Item key="2">
                    <Link to="/admin/condominio">Condomínio</Link>
                  </Menu.Item>
                ) : null}

                {this.isPermitido(2) ? (
                  <Menu.Item key="3">
                    <Link to="/admin/tipologia">Tipologia</Link>
                  </Menu.Item>
                ) : null}

                {this.isPermitido(3) ? (
                  <Menu.Item key="4">
                    <Link to="/admin/unidade-autonoma">Unidades autônomas</Link>
                  </Menu.Item>
                ) : null}

                {this.isPermitido(4) ? (
                  <Menu.Item key="5">
                    <Link to="/admin/areas-gerais">Área comum geral</Link>
                  </Menu.Item>
                ) : null}

                {this.isPermitido(5) ? (
                  <Menu.Item key="6">
                    <Link to="/admin/areas-comuns">
                      Área comum da tipologia
                    </Link>
                  </Menu.Item>
                ) : null}

                {this.isPermitido(6) ? (
                  <Menu.Item key="7">
                    <Link to="/admin/parametrizacao">
                      Visualizar Parametrização
                    </Link>
                  </Menu.Item>
                ) : null}

                {this.isPermitido(7) ? (
                  <Menu.Item key="8">
                    <Link to="/admin/garantia">Itens de garantia</Link>
                  </Menu.Item>
                ) : null}

                {this.isPermitido(8) ? (
                  <Menu.Item key="9">
                    <Link to="/admin/pesquisa">Pesquisa de satisfação</Link>
                  </Menu.Item>
                ) : null}

                {this.isPermitido(9) ? (
                  <Menu.Item key="10">
                    <Link to="/admin/clientes">Clientes</Link>
                  </Menu.Item>
                ) : null}

                <Menu.Item key="12">
                  <Link to="/admin/funcionario">Funcionário</Link>
                </Menu.Item>
              </MenuItemGroup>
            </SubMenu>

            {this.isPermitido(10) ? (
              <Menu.Item key="11">
                <Link to="/admin/chamados">Chamados</Link>
              </Menu.Item>
            ) : null}

            <Menu.Item key="13">
              <Link to="/admin/teste">Custos</Link>
            </Menu.Item>
            <Menu.Item key="14">
              <Link to="/admin/graficos">Gráficos</Link>
            </Menu.Item>
            <Menu.Item key="15">
              <Link to="/admin/biblioteca">biblioteca</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="fundo">
          <Content style={{ margin: '24px 16px 0' }}>
            <Route exact path="/admin/construtora" component={Construtora} />
            <Route exact path="/admin/condominio" component={Condominios} />
            <Route exact path="/admin/tipologia" component={Tipologia} />
            <Route exact path="/admin/unidade-autonoma" component={Unidade} />
            <Route exact path="/admin/areas-comuns" component={AreasComuns} />
            <Route exact path="/admin/areas-gerais" component={AreasGerais} />
            <Route exact path="/admin/garantia" component={Garantia} />
            <Route
              exact
              path="/admin/parametrizacao"
              component={Parametrização}
            />
            <Route exact path="/admin/funcionario" component={Funcionarios} />
            <Route exact path="/admin/permissoes" component={Permissoes} />
            <Route exact path="/admin/clientes" component={Clientes} />
            <Route exact path="/admin/chamados" component={Chamados} />
            {/*<Route exact path="/admin/pesquisa" component={Pesquisa} />
              <Route exact path="/admin/graficos" component={GraficosTotal} />
              <Route exact path="/admin/teste" component={Teste} /> */}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default (Admin = connect(store => {
  return {
    permissoes: store.user.permissoes
  };
})(Admin));
