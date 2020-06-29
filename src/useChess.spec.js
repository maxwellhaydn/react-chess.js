import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { Chess } from 'chess.js';

import useChess from './useChess';

const TestComponent = (props) => null;

const mockOnLegalMove = jest.fn();
const mockOnIllegalMove = jest.fn();
const mockOnGameOver = jest.fn();
const mockOnCheck = jest.fn();
const mockOnCheckmate = jest.fn();

const App = () => {
    const props = useChess({
        onLegalMove: mockOnLegalMove,
        onIllegalMove: mockOnIllegalMove,
        onGameOver: mockOnGameOver,
	onCheck: mockOnCheck,
        onCheckmate: mockOnCheckmate,
    });
    return <TestComponent {...props} />;
};

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const mockMove = jest.fn().mockReturnValue(true);
const mockHistory = jest.fn().mockReturnValue([]);
const mockGameOver = jest.fn().mockReturnValue(false);
const mockFen = jest.fn().mockReturnValue(INITIAL_FEN);
const mockReset = jest.fn();
const mockUndo = jest.fn();
const mockTurn = jest.fn().mockReturnValue('w');
const mockCheck = jest.fn().mockReturnValue(false);
const mockCheckmate = jest.fn().mockReturnValue(false);

jest.mock('chess.js', () => ({
    Chess: jest.fn().mockImplementation(() => ({
        move: mockMove,
        history: mockHistory,
        game_over: mockGameOver,
        in_check: mockCheck,
        in_checkmate: mockCheck,
        fen: mockFen,
        reset: mockReset,
        undo: mockUndo,
        turn: mockTurn
    }))
}));

describe('useChess', () => {

    let wrapper;

    beforeEach(() => {
        jest.clearAllMocks();
        wrapper = mount(<App />);
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

        it('should return the starting board position', () => {
            expect(wrapper.find(TestComponent))
                .to.have.prop('fen').equal(INITIAL_FEN);
        });

        it('should return the player whose turn it is', () => {
            expect(wrapper.find(TestComponent)).to.have.prop('turn').equal('w');
        });

    });

    describe('move', () => {

        beforeEach(() => {
            mockMove.mockReturnValue(true);
            mockHistory.mockReturnValue([]);
            mockGameOver.mockReturnValue(false);
        });

        it('should call onLegalMove after a legal move is made', () => {
            act(() => {
                wrapper.find(TestComponent).props().move('e4');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('e4');
            expect(mockOnIllegalMove).to.not.have.beenCalled();
        });

        it('should call onIllegalMove after an illegal move is made', () => {
            mockMove.mockReturnValue(null);

            act(() => {
                wrapper.find(TestComponent).props().move('e7');
            });

            wrapper.update();

            expect(mockOnIllegalMove).to.have.beenCalledWith('e7');
            expect(mockOnLegalMove).to.not.have.beenCalled();
        });

        it('should update the move history after a legal move', () => {
            mockHistory.mockReturnValue(['e4']);

            act(() => {
                wrapper.find(TestComponent).props().move('e4');
            });

            wrapper.update();

            expect(wrapper.find(TestComponent))
                .to.have.prop('history').deep.equal(['e4']);
        });

        it('should call onGameOver when the game is over', () => {
            mockGameOver.mockReturnValue(true);

            act(() => {
                wrapper.find(TestComponent).props().move('a4');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('a4');
            expect(mockOnGameOver).to.have.beenCalled();
        });

        it('should call onCheck when a move puts the next player in check', () => {
            mockCheck.mockReturnValue(true);

            act(() => {
                wrapper.find(TestComponent).props().move('Qe7');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('Qe7');
            expect(mockOnCheck).to.have.beenCalled();
        });

        it('should call onCheckmate when a move puts the next player in checkmate', () => {
            mockCheckmate.mockReturnValue(true);

            act(() => {
                wrapper.find(TestComponent).props().move('Qh2');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('Qh2');
            expect(mockOnCheckmate).to.have.beenCalled();
        });

        it('should update the history after a series of moves', () => {
            mockMove.mockReturnValueOnce(true)
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(true);

            const history = [];
            mockHistory.mockReturnValue(history);

            ['e4', 'e5', 'Ba8', 'Nf3'].forEach(move => {
                if (move !== 'Ba8') history.push(move);
                act(() => {
                    wrapper.find(TestComponent).props().move(move);
                });

                wrapper.update();
            });

            expect(mockOnLegalMove).to.have.beenCalledTimes(3);
            expect(mockOnIllegalMove).to.have.beenCalledTimes(1);
            expect(wrapper.find(TestComponent))
                .to.have.prop('history').deep.equal(['e4', 'e5', 'Nf3']);
        });

        it('should update the board position after a legal move', () => {
            mockHistory.mockReturnValue(['e4']);
            mockFen.mockReturnValue(
                'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
            );

            act(() => {
                wrapper.find(TestComponent).props().move('e4');
            });

            wrapper.update();

            expect(wrapper.find(TestComponent))
                .to.have.prop('fen').equal(
                    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
                );
        });

        it('should update the turn after a legal move', () => {
            mockTurn.mockReturnValue('b');

            act(() => {
                wrapper.find(TestComponent).props().move('e4');
            });

            wrapper.update();

            expect(wrapper.find(TestComponent)).to.have.prop('turn').equal('b');
        });

    });

    describe('reset', () => {

        it('should reset the history, board position, and turn', () => {
            mockHistory.mockReturnValue(['blank', 'history']);
            mockFen.mockReturnValue('starting fen');
            mockTurn.mockReturnValue('starting player');

            act(() => {
                wrapper.find(TestComponent).props().reset();
            });

            wrapper.update();

            expect(mockReset).to.have.beenCalledTimes(1);
            expect(wrapper.find(TestComponent))
                .to.have.prop('history').deep.equal(['blank', 'history']);
            expect(wrapper.find(TestComponent))
                .to.have.prop('fen').equal('starting fen');
            expect(wrapper.find(TestComponent))
                .to.have.prop('turn').equal('starting player');
        });

    });

    describe('undo', () => {

        it('should update the history, board position, and turn', () => {
            mockHistory.mockReturnValue(['e4', 'e5']);
            mockFen.mockReturnValue('foo');
            mockTurn.mockReturnValue('previous player');

            act(() => {
                wrapper.find(TestComponent).props().undo();
            });

            wrapper.update();

            expect(mockUndo).to.have.beenCalledTimes(1);
            expect(wrapper.find(TestComponent))
                .to.have.prop('history').deep.equal(['e4', 'e5']);
            expect(wrapper.find(TestComponent))
                .to.have.prop('fen').equal('foo');
            expect(wrapper.find(TestComponent))
                .to.have.prop('turn').equal('previous player');
        });

    });

});
