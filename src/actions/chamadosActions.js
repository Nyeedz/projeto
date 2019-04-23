import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchChamados() {
  return function (dispatch) {
    dispatch({
      type: 'GET_CHAMADOS',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/chamados`, config)
      .then(res => {
        dispatch({
          type: 'GET_CHAMADOS_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_CHAMADOS_ERROR',
          payload: 'deu erro'
        });
      });
  };
}
