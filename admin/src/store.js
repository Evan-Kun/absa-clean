import { legacy_createStore as createStore } from 'redux'

// Initial state with user data
const initialState = {
  sidebarShow: true,
  theme: 'light',
  user: null,
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
