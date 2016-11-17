import React from 'react';
import { Link } from 'react-router';
import { translate } from '../../languages/translate';

const AccountIcon = () => {
	const fillColor1 = '#555555';
	return (
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 120" enableBackground="new 0 0 100 100" xmlSpace="preserve"><path d="M50,25c-7.7,0-14,4.9-14,13.5c0,6.3,3.4,13.4,8.3,16.6C46,56.3,48,57,50,57s4-0.7,5.7-1.9c4.9-3.3,8.3-10.3,8.3-16.6  C64,29.9,57.7,25,50,25z" fill={fillColor1} /><path d="M50,8C26.8,8,8,26.8,8,50s18.8,42,42,42s42-18.8,42-42S73.2,8,50,8z M71.3,81.5C74.2,77,76,72,76,67.8  c0-8.3-6.8-11.3-16.1-12.4C57.2,58.2,53.8,60,50,60s-7.2-1.8-9.9-4.5c-9.2,1-16.1,4.1-16.1,12.4c0,4.2,1.8,9.1,4.7,13.6  C18.6,74.6,12,63.1,12,50c0-21,17-38,38-38s38,17,38,38C88,63.1,81.4,74.6,71.3,81.5z" fill={fillColor1} /></svg>
	)
};

const NotLogged = ({ origin, locale }) => {
	const originUrl = origin != '' ? `/sign/in/o=${origin}` : '/sign/in/';
    return (
        <div className="not-logged-account">
        	<div className="icon">
        		<AccountIcon />
        	</div>
        	<div className="title">Sua conta</div>
        	<div className="text">Cadastre-se para aparecer no mapa das bibliotecas.</div>
        	<div className="text">
        		<Link to={originUrl}><button type="button" className="button gradient-1 signin">Clique aqui para entrar</button></Link>
        	</div>
         	<div className="text">
        		ou <Link to="/sign/up/o=account">clique aqui para se cadastrar</Link>
        	</div>
        	


        	<div className="icon-credit">O ícone acima foi criado por Kid A, from the Noun Project.</div>

        </div>
    )
}

NotLogged.defaultProps = {
	origin: ""
}

export default NotLogged;
