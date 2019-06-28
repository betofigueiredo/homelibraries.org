import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

class ContactsSearchInput extends Component {
	constructor() {
		super();
		this.state = {
			value: '',
			dropdown: false,
		};
		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleEdition = this.handleEdition.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.dropdown !== this.props.dropdown) this.setState({ dropdown: nextProps.dropdown });
	}

	handleFocus() {
		this.setState({ dropdown: true });
		this.props.updateUi(['dropdown'], true);
	}

	handleBlur() {
		this.setState({ dropdown: false });
		this.props.updateUi(['dropdown'], false);
	}

	handleEdition(e) {
		const value = e.target.value.toString();
		this.setState({ value });
		// this.props.auxiliarFunction(this.props.fields, value);
	}

	selectContact(id) {
		const contacts_selecteds = [...this.props.contacts_selecteds, id].filter((el, i, a) => i === a.indexOf(el));
		this.props.updateDocs(['create_doc', 'contacts'], contacts_selecteds);
	}

	render() {
		const { dropdown } = this.state;
		const { request_state, contacts_all_ids, contacts_by_id, contacts_selecteds } = this.props;
		const dropdown_class = dropdown ? 'dropdown-pane is-open' : 'dropdown-pane';

		return (
			<div>
				{request_state === 2 ? (
					<input
						type="text"
						className="form-control"
						data-dropdown
						value={this.state.value}
						onFocus={this.handleFocus}
						onChange={this.handleEdition} />
				) : (
					<input
						type="text"
						className="form-control"
						data-dropdown
						value="Carregando contatos..."
						onChange={this.handleEdition}
						disabled />
				)}

				<div className={dropdown_class} data-dropdown>
					{contacts_all_ids.map(id => {
						if (contacts_selecteds.findIndex(i => i === id) === -1) {
							return (
								<button
									key={id}
									type="button"
									data-dropdown
									onClick={() => this.selectContact(id)}>
									{contacts_by_id[id].name}
								</button>
							);
						}
						return (
							<div key={id} data-dropdown>
								{contacts_by_id[id].name}
							</div>
						);
					})}
				</div>

			</div>
		);
	}
}

ContactsSearchInput.propTypes = {
	request_state: PropTypes.number,
	contacts_by_id: PropTypes.object.isRequired,
	contacts_all_ids: PropTypes.array.isRequired,
	contacts_selecteds: PropTypes.array.isRequired,
	updateUi: PropTypes.func.isRequired,
	updateDocs: PropTypes.func.isRequired,
	dropdown: PropTypes.bool.isRequired,
	// default_value: PropTypes.string,
	// auxiliarFunction: PropTypes.func,
};

ContactsSearchInput.defaultProps = {
	request_state: 2,
	// default_value: '',
	// auxiliarFunction: () => {},
};

export default CSSModules(ContactsSearchInput, styles, { allowMultiple: true });
