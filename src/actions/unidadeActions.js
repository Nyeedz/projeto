import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchUnidades() {
  return function(dispatch) {
    dispatch({
      type: 'GET_UNIDADE',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/unidadesAutonomas`, config)
      .then(res => {
        dispatch({
          type: 'GET_UNIDADE_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_UNIDADE_ERROR',
          payload: 'deu erro'
        });
      });
  };
}
