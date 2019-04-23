import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchAreasGerais() {
  return function(dispatch) {
    dispatch({
      type: 'GET_AREAS_GERAIS',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/areasgerais`, config)
      .then(res => {
        dispatch({
          type: 'GET_AREAS_GERAIS_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_AREAS_GERAIS_ERROR',
          payload: 'deu erro'
        });
      });
  };
}
