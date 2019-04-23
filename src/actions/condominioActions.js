import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchCondominios() {
  return function(dispatch) {
    dispatch({
      type: 'GET_CONDOMINIOS',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/condominios`, config)
      .then(res => {
        dispatch({
          type: 'GET_CONDOMINIOS_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_CONDOMINIOS_ERROR',
          payload: 'deu erro'
        });
      });
  };
}
