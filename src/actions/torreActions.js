import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchTorre() {
  return function(dispatch) {
    dispatch({
      type: 'GET_TORRE',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/torre`, config)
      .then(res => {
        dispatch({
          type: 'GET_TORRE_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_TORRE_ERROR',
          payload: `Deu erro ${err}`
        });
      });
  };
}
