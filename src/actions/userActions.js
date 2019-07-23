import axios from 'axios';
import { url } from '../utilities/constants';

export function saveUser(obj) {
  return {
    type: 'USER_LOGGEDIN',
    payload: obj
  };
}

export function logout() {
  return {
    type: 'USER_LOGGEDOUT',
    payload: {}
  };
}

export function getMe() {
  return function(dispatch) {
    dispatch({
      type: 'GET_ME',
      payload: {}
    });
    let auth = localStorage.getItem('jwt');

    const config = {
      headers: { Authorization: `Bearer ${auth}` }
    };
    axios
      .get(`${url}/users/me`, config)
      .then(res => {
        dispatch({
          type: 'GET_ME_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: 'GET_ME_ERROR',
          payload: 'deu erro'
        });
      });
  };
}