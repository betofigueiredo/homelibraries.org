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

export const buildMapStateToProps = props => ({
	libraries: props.libraries,
	map: props.map,
	mybooks: props.mybooks,
	search: props.search,
	ui: props.ui,
	user: props.user,
});

export const buildmapDispatchToProps = dispatch => (
	bindActionCreators(actions, dispatch)
);
