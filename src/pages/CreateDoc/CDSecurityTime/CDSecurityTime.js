import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from '../style.module.scss';

// Components
import StatusBar from '../../../components/StatusBar/StatusBar';
import InputNumber from '../../../components/_inputs/InputNumber/InputNumber';

const CDSecurityTime = ({
	// =========== state
	// =========== props
	docs,
	ui,
	// =========== props funcs
	updateDocs,
	// =========== local funcs
}) => {
	const { create_doc } = docs;
	const { steps_create_doc } = ui;

	return (
		<div className="grid-container" styleName="doc-wrapper">
			<div className="grid-x">
				<div className="medium-12 cell" style={{ textAlign: 'center' }}>
					<StatusBar
						steps={steps_create_doc}
						active_step={3} />
				</div>
			</div>
			<div className="grid-x">
				<div className="medium-12 cell">
					<label>
						Tempo de segurança
						<InputNumber
							field={['create_doc', 'security_time']}
							default_value={create_doc.security_time}
							updateFunc={updateDocs} />
					</label>
				</div>
			</div>
			<div className="grid-x">
				<div className="medium-12 cell">
					<Link
						to="/create/doc/content"
						className="button">
						Escrever documento <i className="fa fa-angle-right" aria-hidden="true" style={{ marginLeft: '4px' }} />
					</Link>
				</div>
			</div>
			<div className="grid-x">
				<div className="small-12 cell"><p><br /></p></div>
			</div>
		</div>
	);
};

CDSecurityTime.propTypes = {
	// =========== state
	// =========== props
	docs: PropTypes.object.isRequired,
	ui: PropTypes.object.isRequired,
	// =========== props funcs
	updateDocs: PropTypes.func.isRequired,
	// =========== local funcs
};

export default CSSModules(CDSecurityTime, styles, { allowMultiple: true });
