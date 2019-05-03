export default function(
  state = {
    data: [],
    fetching: null,
    fetched: null,
    error: null
  },
  action
) {
  switch (action.type) {
    case 'GET_TIPOLOGIA':
      return {
        ...state,
        fetching: true,
        fetched: null,
        error: null
      };
    case 'GET_TIPOLOGIA_SUCCESS':
      return {
        ...state,
        fetching: null,
        fetched: true,
        error: null,
        data: action.payload
      };
    case 'GET_TIPOLOGIA_ERROR':
      return {
        ...state,
        fetching: null,
        fetched: null,
        error: action.payload
      };
    default:
      return state;
  }
}
