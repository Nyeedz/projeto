import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchGarantias() {
  return function(dispatch) {
    dispatch({
      type: 'GET_GARANTIAS',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');
    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/garantia`, config)
      .then(res => {
        dispatch({
          type: 'GET_GARANTIAS_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_GARANTIAS_ERROR',
          payload: 'deu erro'
        });
      });
  };
}
