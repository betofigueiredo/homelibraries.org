import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
// import * as actionCreators from '../actions/actionCreators';
import * as actionChat from '../actions/actionChat';
import * as actionLibraries from '../actions/actionLibraries';
import * as actionMyBooks from '../actions/actionMyBooks';
import * as actionProfiles from '../actions/actionProfiles';
import * as actionSignIn from '../actions/actionSignIn';
import * as actionTalks from '../actions/actionTalks';
const actionCreators = Object.assign({}, actionChat, actionLibraries, actionMyBooks, actionProfiles, actionSignIn, actionTalks);

import Main from './Main';

function mapStateToProps({ chat, libraries, mybooks, profiles, user, talks }) {
	return { chat, libraries, mybooks, profiles, user, talks }
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(actionCreators, dispatch);
}

const App = connect(mapStateToProps, mapDispatchToProps)(Main);

export default App;
