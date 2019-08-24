/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { buildMapStateToProps, buildmapDispatchToProps } from '../../store/reduxDispatchs';

// Redux HOC
import withStore from '../../store/withStore';

// Components
import SignIn from './SignIn';

// Functions
import { _post } from '../../functions/_requests';
// import { handleRequestErrors } from '../../functions/_handleRequestErrors';
import { getLocalstorageData } from '../../functions/_getLocalstorageData';

class SignInContainer extends Component {
	state = {
		logging: 0,
		email: '',
		password: '',
	};

	componentDidMount() {
		const { history } = this.props;
		const token = getLocalstorageData('user', 'token');
		if (token !== '') {
			history.replace('/libraries');
		}
	}

	handleEdition = (e) => {
		const typed = e.target.value.toString();
		switch (e.target.id) {
		case 'email': this.setState({ email: typed }); break;
		case 'password': this.setState({ password: typed }); break;
		default:
		}
		this.resetErrors();
	}

	resetErrors = () => {
		const { logging } = this.state;
		if (logging !== 1) {
			this.setState({ logging: 0 });
		}
	}

	setAuthLocalstorage = (token, user) => {
		const user_localstorage = {
			token,
			email: user.email,
			id: user.id,
			username: user.username,
			name: user.name,
			color: user.color,
			lfl: user.lfl,
			// notifications: user.messages_n,
		};
		localStorage.setItem('user', JSON.stringify(user_localstorage));
		localStorage.setItem('locale', user.language);
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({ logging: 1 });
		const { updateUserRaw, history } = this.props;
		const { email, password } = this.state;
		_post('/auth/signin', { email, password }).then(response => {
			if (response.data.success) {
				const { token, user } = response.data;
				this.setAuthLocalstorage(token, user);
				updateUserRaw({
					logged: true,
					token,
					email,
					id: user.id,
					username: user.username,
					name: user.name,
					language: user.language,
					color: user.color,
					lfl: user.lfl,
				});
				history.push('/libraries');
				return;
			}

			switch (response.data.reason) {
			case 'wrong email':
				this.setState({ logging: 4 });
				break;
			case 'wrong password':
				this.setState({ logging: 5 });
				break;
			default:
				this.setState({ logging: 3 });
			}
		}).catch(() => {
			this.setState({ logging: 3 });
			// handleRequestErrors(error);
		});
	}

	render() {
		return (
			<SignIn
				{...this.state}
				{...this.props}
				updateState={this.updateState}
				handleSubmit={this.handleSubmit}
				handleEdition={this.handleEdition} />
		);
	}
}

const mapStateToProps = (props) => buildMapStateToProps(props);
const mapDispatchToProps = (dispatch) => buildmapDispatchToProps(dispatch);
export default withStore(connect(mapStateToProps, mapDispatchToProps)(SignInContainer));
