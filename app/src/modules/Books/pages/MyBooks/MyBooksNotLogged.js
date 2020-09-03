import React from 'react';
import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import LayoutWrapper from '../../../shared/components/LayoutWrapper';

const MyBooksNotLogged = () => (
	<LayoutWrapper>
		<div className="grid-container" styleName="smaller-grid-container">
			<div className="grid-x grid-padding-x">
				<div className="small-12 cell" styleName="wrapper">
					<div styleName="icon-wrapper">
						<i className="fa fa-book" aria-hidden="true" />
					</div>
					<h3 styleName="h3">Faça seu cadastro</h3>
					<Link to="/sign/in">Entrar</Link>
				</div>
			</div>
		</div>
	</LayoutWrapper>
);

export default CSSModules(MyBooksNotLogged, styles, { allowMultiple: true });
