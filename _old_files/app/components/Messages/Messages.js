import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// components
import { Loading } from '../shared/Loadings';
import ActionBar from '../Navigation/ActionBar';
import NavigationBar from '../Navigation/NavigationBar';
import NotLogged from './NotLogged';
import TalkRow from './TalkRow';

class Messages extends Component {
    constructor() {
        super();
        this._renderLoading = this._renderLoading.bind(this);
        this._renderError = this._renderError.bind(this);
        this._renderTalks = this._renderTalks.bind(this);
        this._renderNotLogged = this._renderNotLogged.bind(this);
    }

    componentDidMount() {
        this.props.getTalks(this.props.params.id);
    }

    _renderLoading() {
    	return (
			<div className="messages-wrapper">
				<ActionBar {...this.props} />
				<NavigationBar {...this.props} />
    			<Loading />
    		</div>
    	)
    }

    _renderError() {
    	return (
			<div className="messages-wrapper">
				<ActionBar {...this.props} />
				<NavigationBar {...this.props} />
    			<div>Uh oh: </div>
    		</div>
    	)
    }

    _renderNotLogged() {
    	return (
			<div className="messages-wrapper">
				<ActionBar {...this.props} />
				<NavigationBar {...this.props} />
    			<NotLogged origin="messages" locale={this.props.user.language} />
    		</div>
    	)
    }

    _renderTalks() {
    	return (
			<div className="messages-wrapper">
				<ActionBar {...this.props} />
				<NavigationBar {...this.props} />

			    <div className="expanded collapse row">
			        <div className="small-12 columns">
			            <div className="messages-search">
			                <input type="text" id="messages-search" name="messages-search" className="messages-search-input" placeholder="Busque conversas..." />
			            </div>
			        </div>
			    </div>

                {this.props.talks.data.map((talk, i) => {
                    return (
					    <TalkRow
							key={i}
					    	chatId={talk.id_url}
					    	name={talk.name}
					    	letters={talk.letters}
					    	location={talk.location}
					    	picture={talk.picture}
					    	read={talk.read}
					    	color={talk.color} />
                    )
                })}

    		</div>
    	)
    }

	render () {
		let { loading } = this.props.talks;
	    switch(loading) {
	    	/* Loading ================================ */
	    	case 0:
	    	case 1:
	    		return this._renderLoading(); break;
	    	/* Error ================================== */
	        case 3:
	        	return this._renderError(); break;
	    	/* Loaded ================================= */
	        case 2:
	        default:
	        	if (this.props.talks.data[0].logged === false) {
	        		/* Not logged ===================== */
	        		return this._renderNotLogged();
	        	} else {
	        		/* Ok ============================= */
	        		return this._renderTalks();
	        	}
	    }
	}

}

export default Messages;
