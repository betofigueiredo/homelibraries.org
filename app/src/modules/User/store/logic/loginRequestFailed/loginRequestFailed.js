import { getGraphQLErrorMessage } from '../../../../shared/functions/getGraphQLErrorMessage';

function loginRequestFailed(_state, _action) {
	const state = _state || {};
	const action = _action || {};
	const error_message = getGraphQLErrorMessage(action.error);

	return {
		...state,
		logging_in: 30,
		error_message,
	};
}

export default loginRequestFailed;
