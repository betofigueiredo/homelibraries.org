import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import axios from 'axios';

// components
import { Loading } from '../shared/Loadings';
import ActionBar from '../Navigation/ActionBar';
import NavigationBar from '../Navigation/NavigationBar';

const ChatMessage = ({ chatTextClass, message }) => {
    return (
    	<div className={chatTextClass}>
            <div className="chat-text-content">{message}</div>
        </div>
    )
}

class Chat extends Component {
    constructor() {
        super();
        this._renderLoading = this._renderLoading.bind(this);
        this._renderError = this._renderError.bind(this);
        this._renderChat = this._renderChat.bind(this);
        this._renderNotLogged = this._renderNotLogged.bind(this);
        this._checkNewMessages = this._checkNewMessages.bind(this);
    }

    componentDidMount() {
        this.props.getChat(this.props.params.id);
    }

    componentWillUnmount() {
        window.clearInterval(this.checkNewMessagesInterval);
    }

    _renderLoading() {
    	return (
			<div className="chat-wrapper">
			    <div className="chat-header">
			    	<Link to="/messages/"><i className="fa fa-angle-left" aria-hidden="true"></i></Link>
			        <div className="chat-header-name"></div>
			    </div>
    			<Loading />
    		</div>
    	);
    }
    _renderError()          { return <div>Uh oh: </div>; }
    _renderNotLogged()      { return <div>Sorry, you are not logged</div>; }

    _checkNewMessages() {
        this.checkNewMessagesInterval = setInterval(() => {
        	// const actualDateObject = new Date();
        	// const actualDate = `${actualDateObject.getFullYear()}-${actualDateObject.getMonth()+1}-${actualDateObject.getDate()} ${actualDateObject.getHours()}:${actualDateObject.getMinutes()}:${actualDateObject.getSeconds()}`;
            const lastMessageDate = this.props.chat.messages[this.props.chat.messages.length-1].created;
            axios.get(`https://www.homelibraries.org/requests/chat-check/${this.props.params.id}/${lastMessageDate}/`)
                .then((response) => {
                    if (response.data == 'new') {
                        console.log(response.data);
                        this.props.updateChat(this.props.params.id);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }, 4000);
    }

    _renderChat() {

        // Check new messages
        this._checkNewMessages();
        const scrollDown = window.setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight);
        }, 50);

        return (
			<div className="chat-wrapper">
			    <div className="chat-header">
			    	<Link to="/messages/"><i className="fa fa-angle-left" aria-hidden="true"></i></Link>
			        <div className="chat-header-name">{this.props.chat.name}</div>
			        <div className="chat-header-profile-pic" style={{backgroundColor: '#9b9fd0'}}>IP</div>
			    </div>

			    <div className="chat-new-message">
			    	<input type="text" id="messages-search" name="messages-search" placeholder="Nova mensagem..." />
			    </div>

				<div className="row expanded collapse chat-messages-wrapper">
					<div className="small-12 columns">
                        {this.props.chat.messages.map((message, i) => {
                        	const chatTextClass = `chat-text-${message.position}`;
                            return (
                            	<ChatMessage
                            		key={i}
                            		chatTextClass={chatTextClass}
                            		message={message.message} />
                            )
                        })}
					</div>
				</div>
			</div>
        );
    }

	render () {
		let loadingState = this.props.chat.loading;
	    switch(loadingState) {
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
	        	if (this.props.chat.messages[0].logged === false) {
	        		/* Not logged ===================== */
	        		return this._renderNotLogged();
	        	} else {
	        		/* Ok ============================= */
	        		return this._renderChat();
	        	}
	    }
	}
}

export default Chat;
