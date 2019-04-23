import axios from 'axios';
import {url} from '../utilities/constants';

export function fetchClientes () {
  return function (dispatch) {
    dispatch ({
      type: 'GET_CLIENTES',
      payload: {},
    });
    let auth = localStorage.getItem ('jwt');

    const config = {
      headers: {Authorization: `Bearer ${auth}`},
    };
    axios
      .get (`${url}/users?cliente=true`, config)
      .then (res => {
        dispatch ({
          type: 'GET_CLIENTES_SUCCESS',
          payload: res.data,
        });
      })
      .catch (err => {
        dispatch ({
          type: 'GET_CLIENTES_ERROR',
          payload: 'deu erro',
        });
      });
  };
}
