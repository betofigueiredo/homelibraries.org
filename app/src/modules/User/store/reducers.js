import user from './store';
import reducerUtil from '../../../utils/redux/reducerUtil';

// Actions external logic
import loginReceived from './logic/loginReceived';
import loginRequested from './logic/loginRequested';
import loginRequestFailed from './logic/loginRequestFailed';

const funcs = {
	LOGIN_REQUESTED: loginRequested,
	LOGIN_RECEIVED: loginReceived,
	LOGIN_REQUEST_FAILED: loginRequestFailed,
};

const reducer = reducerUtil(user, funcs);
export default reducer;
