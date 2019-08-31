/* eslint-disable */
import React from 'react';
import Enzyme, { shallow, mount, render } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import ConversationMessage from './ConversationMessage';

Enzyme.configure({ adapter: new EnzymeAdapter() });
jest.mock('react-css-modules', () => ConversationMessage => ConversationMessage);

test('ConversationMessage render ok', () => {
	// const wrapper = shallow(<ConversationMessage />);
	// expect(
	// 	wrapper.find('[data-test="component-conversation-message"]').length
	// ).toBe(1);
});
