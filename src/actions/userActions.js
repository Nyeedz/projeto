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
