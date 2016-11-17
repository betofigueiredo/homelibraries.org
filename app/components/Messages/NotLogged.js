import React from 'react';
import { Link } from 'react-router';
import { translate } from '../../languages/translate';

const MyBooksIcon = () => {
	const fillColor1 = '#555555';
	return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 62.5" x="0px" y="0px"><path d="M27.25,7A35.73,35.73,0,0,0,9.83,11.37C4.05,14.72,1,19.43,1,25S4.08,35.26,9.7,38.55a11.73,11.73,0,0,1-7,6.51A1,1,0,0,0,3,47H3.44c2.11,0,10.73-.27,17.49-4.54a38.35,38.35,0,0,0,6.33.54C40.46,43,49,35.93,49,25S40.46,7,27.25,7Zm0,34a36.48,36.48,0,0,1-6.36-.57,1,1,0,0,0-.72.15C16,43.28,11,44.34,7.41,44.75a14.66,14.66,0,0,0,4.49-6.28,1,1,0,0,0-.46-1.24C7.59,35.16,3,31.35,3,25,3,14,17.18,9,27.25,9,36.8,9,47,13.2,47,25S36.8,41,27.25,41ZM37,25a2,2,0,1,1-2-2A2,2,0,0,1,37,25ZM27,25a2,2,0,1,1-2-2A2,2,0,0,1,27,25ZM17,25a2,2,0,1,1-2-2A2,2,0,0,1,17,25Z" fill={fillColor1} /></svg>
	)
};

const NotLogged = ({ origin, locale }) => {
	const originUrl = origin != '' ? `/sign/in/o=${origin}` : '/sign/in/';
    return (
        <div className="not-logged-messages">
        	<div className="icon">
        		<MyBooksIcon />
        	</div>
        	<div className="title">Converse e troque livros</div>
        	<div className="text">Aqui você cadastra os seus livros que estão disponíveis para empréstimo.</div>
        	<div className="text">
        		<Link to={originUrl}><button type="button" className="button gradient-1 signin">Clique aqui para entrar</button></Link>
        	</div>
         	<div className="text">
        		ou <Link to="/sign/up/o=messages">clique aqui para se cadastrar</Link>
        	</div>
        	


        	<div className="icon-credit">O ícone acima foi criado por Karthik Aathis, from the Noun Project.</div>

        </div>
    )
}

NotLogged.defaultProps = {
	origin: ""
}

export default NotLogged;
