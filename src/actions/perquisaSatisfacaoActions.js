import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchPerguntas() {
  return function(dispatch) {
    dispatch({
      type: 'GET_PERGUNTAS',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/pesquisasatisfacaos`, config)
      .then(res => {
        dispatch({
          type: 'GET_PERGUNTAS_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_PERGUNTAS_ERROR',
          payload: 'deu erro'
        });
      });
  };
}
