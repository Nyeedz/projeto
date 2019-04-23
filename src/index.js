import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Layout, LocaleProvider } from 'antd';
import registerServiceWorker from './registerServiceWorker';
import pt_BR from 'antd/lib/locale-provider/pt_BR';
import 'moment/locale/pt-br';

import store from './store';
import { Provider } from 'react-redux';

//estilo
import '../node_modules/antd/dist/antd.css';
import './main.css';

//componentes
import Login from './components/login';
import Admin from './components/admin';
import Navbar from './components/navbar';
import requireAuth from './components/Hoc/requireAuth';
import Configuracoes from './components/configuracoes';
import Sobre from './components/sobre';
import Chamados from './components/chamados';
import ListaChamados from './components/chamados/listaChamados';
import Perfil from './components/perfil';
import axios from 'axios';

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Layout style={{ minHeight: '100vh' }}>
            {localStorage.getItem('jwt') ? (
              <Navbar />
            ) : null}
            <Switch>
              <Route exact path="/" component={Login} />
              <Route path="/admin" component={requireAuth(Admin)} />
              <Route path="/sobre" component={Sobre} />
              <Route path="/chamados" component={requireAuth(Chamados)} />
              <Route
                path="/lista-chamados"
                component={requireAuth(ListaChamados)}
              />
              <Route
                path="/configuracoes"
                component={requireAuth(Configuracoes)}
              />
              <Route path="/perfil" component={requireAuth(Perfil)} />
            </Switch>
          </Layout>
        </BrowserRouter>
      </Provider>
    );
  }
}

ReactDOM.render(
  <LocaleProvider locale={pt_BR}>
    <App />
  </LocaleProvider>,
  document.getElementById('root')
);
registerServiceWorker();
