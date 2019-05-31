import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchFuncionarios() {
  return function(dispatch) {
    dispatch({
      type: 'GET_FUNCIONARIOS',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/users?funcionario=true`, config)
      .then(res => {
        dispatch({
          type: 'GET_FUNCIONARIOS_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_FUNCIONARIOS_ERROR',
          payload: 'deu erro'
        });
      });
  };
}
