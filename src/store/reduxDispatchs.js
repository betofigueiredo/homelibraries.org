import { bindActionCreators } from 'redux';
import * as librariesActions from './libraries/actions';
import * as mapActions from './map/actions';
import * as mybooksActions from './mybooks/actions';
import * as searchActions from './search/actions';
import * as uiActions from './ui/actions';
import * as userActions from './user/actions';

const actions = {
	...librariesActions,
	...mapActions,
	...mybooksActions,
	...searchActions,
	...uiActions,
	...userActions,
};

export const buildMapStateToProps = (props, fields = null) => {
	if (fields === null) {
		return ({
			libraries: props.libraries,
			map: props.map,
			mybooks: props.mybooks,
			search: props.search,
			ui: props.ui,
			user: props.user,
		});
	}

	return fields.reduce((result, current) => ({
		...result,
		[current]: { ...props[current] },
	}), {});
};

// export const buildMapStateToProps = props => ({
// 	libraries: props.libraries,
// 	map: props.map,
// 	mybooks: props.mybooks,
// 	search: props.search,
// 	ui: props.ui,
// 	user: props.user,
// });

export const buildmapDispatchToProps = dispatch => (
	bindActionCreators(actions, dispatch)
);

export const detailedmapDispatchToProps = (dispatch, funcs) => {
	const only_funcs = Object.keys(actions)
		.filter(a => funcs.filter(f => f === a).length > 0)
		.reduce((result, current) => ({
			...result,
			[current]: actions[current],
		}), {});

	return {
		dispatch,
		...bindActionCreators(only_funcs, dispatch),
	};
};
