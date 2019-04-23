import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchParametrizacao() {
  return function(dispatch) {
    dispatch({
      type: 'GET_PARAMETRIZACAO',
      payload: {}
    });
    const config = {
      headers: { Authorization: 'bearer ' + localStorage.getItem('jwt') }
    };
    axios
      .get(`${url}/parametrizacao`, config)
      .then(res => {
        dispatch({
          type: 'GET_PARAMETRIZACAO_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_PARAMETRIZACAO_ERROR',
          payload: 'deu erro'
        });
      });
  };
}
