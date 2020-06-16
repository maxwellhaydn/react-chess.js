import React from 'react';
import { act } from 'react-dom/test-utils';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { Chess } from 'chess.js';

import { useChess } from './useChess';

const TestComponent = (props) => null;

const mockOnLegalMove = jest.fn();
const mockOnIllegalMove = jest.fn();
const mockOnGameOver = jest.fn();

const App = () => {
    const props = useChess({
        onLegalMove: mockOnLegalMove,
        onIllegalMove: mockOnIllegalMove,
        onGameOver: mockOnGameOver
    });
    return <TestComponent {...props} />;
};

const mockMove = jest.fn().mockImplementation(move => true);

jest.mock('chess.js', () => ({
    Chess: jest.fn().mockImplementation(() => ({
        move: mockMove,
        history: () => [],
        game_over: () => false
    }))
}));

describe('useChess', () => {

    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<App />);
    });

    describe('initial props', () => {

        it('should return move', () => {
            expect(wrapper.find(TestComponent))
                .to.have.prop('move')
                .and.to.be.an.instanceOf(Function);
        });

        it('should return an empty history', () => {
            expect(wrapper.find(TestComponent))
                .to.have.prop('history').deep.equal([]);
        });

    });

    describe('move', () => {

        it('should call onLegalMove after a legal move is made', () => {
            act(() => {
                wrapper.find(TestComponent).props().move('e4');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('e4');
        });

        it('should call onIllegalMove after an illegal move is made', () => {
            mockMove.mockImplementation(move => null);

            act(() => {
                wrapper.find(TestComponent).props().move('e7');
            });

            wrapper.update();

            expect(mockOnIllegalMove).to.have.beenCalledWith('e7');
        });

    });

});
