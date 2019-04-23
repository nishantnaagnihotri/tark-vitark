import { combineReducers } from 'redux'
import reducer from './appReducer'

const appReducer = combineReducers({
	app: reducer
});

export default appReducer;