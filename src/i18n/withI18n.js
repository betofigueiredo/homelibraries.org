import React, { Component } from 'react';
import i18n from './i18n';

const languages = [i18n.defaultLanguage, ...i18n.otherLanguages]
	.reduce((result, current) => ({
		...result,
		[current]: require(`../../app/static/locales/${current}/common.json`),
	}), {});

// const multi_files = {
// 	en: require('./requires.js'),
// };

const withI18n = (file = '') => Comp => {
	return class PP extends Component {
		constructor(props) {
			super(props);
			this.state = {
				selected_language: i18n.defaultLanguage,
			};
			this.t = this.t.bind(this);
		}

		t(key) {
			const is_server = typeof window === 'undefined';
			const selected_language = !is_server
				? this.props.user.locale
				: 'en';
			const localeData = (languages[selected_language] || {})[key] || '';
			return localeData;
		}

		render() {
			console.log(this.props);
			return (
				<Comp t={this.t} {...this.props} />
			);
		}
	};
}

export default withI18n;
