import axios from 'axios';
import { url } from '../utilities/constants';

export function fetchAreasComuns() {
  return function(dispatch) {
    dispatch({
      type: 'GET_AREAS_COMUNS',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/areascomuns`, config)
      .then(res => {
        dispatch({
          type: 'GET_AREAS_COMUNS_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_AREAS_COMUNS_ERROR',
          payload: 'deu erro'
        });
      });
  };
}
