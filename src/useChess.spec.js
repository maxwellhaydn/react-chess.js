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

const mockMove = jest.fn();
const mockHistory = jest.fn();
const mockGameOver = jest.fn();

jest.mock('chess.js', () => ({
    Chess: jest.fn().mockImplementation(() => ({
        move: mockMove,
        history: mockHistory,
        game_over: mockGameOver
    }))
}));

describe('useChess', () => {

    let wrapper;

    beforeEach(() => {
        jest.clearAllMocks();
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

        beforeEach(() => {
            mockMove.mockImplementation(move => true);
            mockHistory.mockImplementation(() => []);
            mockGameOver.mockImplementation(() => false);
        });

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

        it('should update the move history after a legal move', () => {
            mockHistory.mockImplementation(() => ['e4']);

            act(() => {
                wrapper.find(TestComponent).props().move('e4');
            });

            wrapper.update();

            expect(wrapper.find(TestComponent))
                .to.have.prop('history').deep.equal(['e4']);
        });

        it('should call onGameOver when the game is over', () => {
            mockGameOver.mockImplementation(() => true);

            act(() => {
                wrapper.find(TestComponent).props().move('e4');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('e4');
            expect(mockOnGameOver).to.have.beenCalled();
        });

        it('should update the history after a series of moves', () => {
            mockMove.mockImplementationOnce(move => true)
                    .mockImplementationOnce(move => true)
                    .mockImplementationOnce(move => null)
                    .mockImplementationOnce(move => true);

            mockHistory.mockImplementationOnce(() => ['e4'])
                       .mockImplementationOnce(() => ['e4', 'e5'])
                       .mockImplementationOnce(() => ['e4', 'e5', 'Nf3'])

            act(() => {
                const move = wrapper.find(TestComponent).prop('move');
                move('e4');
                move('e5');
                move('Ba8');
                move('Nf3');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledTimes(3);
            expect(mockOnIllegalMove).to.have.beenCalledTimes(1);
            expect(wrapper.find(TestComponent))
                .to.have.prop('history').deep.equal(['e4', 'e5', 'Nf3']);
        });

    });

});
