
function reducerUtil(_state, funcs) {
	return (state = _state, action) => {
		const new_state = funcs[action.type] !== undefined
			? funcs[action.type](state, action)
			: { ...state };
		return new_state;
	};
}

export default reducerUtil;
