import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchTipologia() {
  return function(dispatch) {
    dispatch({
      type: 'GET_TIPOLOGIA',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/tipologias`, config)
      .then(res => {
        dispatch({
          type: 'GET_TIPOLOGIA_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_TIPOLOGIA_ERROR',
          payload: `Deu erro ${err}`
        });
      });
  };
}
