/* eslint-disable */
import React from 'react';
import Enzyme, { shallow, mount, render } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import ConversationReply from './ConversationReply';

Enzyme.configure({ adapter: new EnzymeAdapter() });
jest.mock('react-css-modules', () => ConversationReply => ConversationReply);

test('ConversationReply render ok', () => {
	// const wrapper = shallow(<ConversationReply />);
	// expect(
	// 	wrapper.find('[data-test="component-conversation-message"]').length
	// ).toBe(1);
});
