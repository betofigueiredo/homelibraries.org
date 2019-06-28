import { bindActionCreators } from 'redux';
import * as librariesActions from './libraries/actions';
import * as mapActions from './map/actions';
import * as mybooksActions from './mybooks/actions';
import * as uiActions from './ui/actions';
import * as userActions from './user/actions';

const actions = {
	...librariesActions,
	...mapActions,
	...mybooksActions,
	...uiActions,
	...userActions,
};

export const buildMapStateToProps = props => ({
	libraries: props.libraries,
	map: props.map,
	mybooks: props.mybooks,
	ui: props.ui,
	user: props.user,
});

export const buildmapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);
