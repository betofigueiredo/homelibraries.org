import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

// import reducers';
import chat from './chat';
import libraries from './libraries';
import mybooks from './mybooks';
import profiles from './profiles';
import user from './user';
import talks from './talks';

const rootReducer = combineReducers({
	chat,
	libraries,
	mybooks,
	profiles,
	user,
	talks,
	routing: routerReducer
});

export default rootReducer;
