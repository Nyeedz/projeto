import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchConstrutoras() {
  return function(dispatch) {
    dispatch({
      type: 'GET_CONSTRUTORAS',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/construtoras?ativo=true`, config)
      .then(res => {
        dispatch({
          type: 'GET_CONSTRUTORAS_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_CONSTRUTORAS_ERROR',
          payload: 'deu erro'
        });
      });
  };
}
