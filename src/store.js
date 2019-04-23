import { applyMiddleware, createStore } from 'redux';
import logger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import reducer from './reducers';

const middle = [promiseMiddleware(), thunkMiddleware, logger];

export default createStore(reducer, applyMiddleware(...middle));
