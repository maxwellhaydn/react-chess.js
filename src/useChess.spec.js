/**
 * Tests for the `useChess` React hook
 *
 * Copyright © 2020 Maxwell Carey
 *
 * This file is part of react-chess.js.
 *
 * react-chess.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3, as
 * published by the Free Software Foundation.
 *
 * react-chess.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
const mockOnDraw = jest.fn();
const mockOnStalemate = jest.fn();
const mockOnThreefoldRepetition = jest.fn();
const mockOnInsufficientMaterial = jest.fn();

const App = ({ options }) => {
    const props = options ? useChess(options) : useChess();
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
const mockDraw = jest.fn().mockReturnValue(false);
const mockStalemate = jest.fn().mockReturnValue(false);
const mockThreefoldRepetition = jest.fn().mockReturnValue(false);
const mockInsufficientMaterial = jest.fn().mockReturnValue(false);

jest.mock('chess.js', () => ({
    Chess: jest.fn().mockImplementation(() => ({
        move: mockMove,
        history: mockHistory,
        game_over: mockGameOver,
        in_check: mockCheck,
        in_checkmate: mockCheckmate,
        in_draw: mockDraw,
        in_stalemate: mockStalemate,
        in_threefold_repetition: mockThreefoldRepetition,
        insufficient_material: mockInsufficientMaterial,
        fen: mockFen,
        reset: mockReset,
        undo: mockUndo,
        turn: mockTurn
    }))
}));

describe('without args', () => {

    it('#5: should update history and throw no exceptions on move', () => {
        mockHistory.mockReturnValue(['e4']);

        const wrapper = mount(<App />);

        expect(() => {
            act(() => {
                wrapper.find(TestComponent).props().move('e4');
            });
        })
            .to.not.throw();

        expect(wrapper.find(TestComponent))
            .to.have.prop('history').deep.equal(['e4']);
    });

});

describe('with args', () => {

    let wrapper;

    beforeEach(() => {
        jest.clearAllMocks();
        mockHistory.mockReturnValue([]);

        const options = {
            onLegalMove: mockOnLegalMove,
            onIllegalMove: mockOnIllegalMove,
            onGameOver: mockOnGameOver,
            onCheck: mockOnCheck,
            onCheckmate: mockOnCheckmate,
            onDraw: mockOnDraw,
            onStalemate: mockOnStalemate,
            onThreefoldRepetition: mockOnThreefoldRepetition,
            onInsufficientMaterial: mockOnInsufficientMaterial,
        };
        wrapper = mount(<App options={options} />);
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
            mockMove.mockImplementation(move => ({ san: move }));
            mockHistory.mockReturnValue([]);
            mockGameOver.mockReturnValue(false);
            mockCheck.mockReturnValue(false);
            mockCheckmate.mockReturnValue(false);
            mockDraw.mockReturnValue(false);
            mockStalemate.mockReturnValue(false);
            mockThreefoldRepetition.mockReturnValue(false);
            mockInsufficientMaterial.mockReturnValue(false);
        });

        it('should call onLegalMove after a legal move is made', () => {
            mockMove.mockReturnValue({ san: 'e4+' });

            act(() => {
                wrapper.find(TestComponent).props().move('e4');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('e4+');
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

        it('should call onDraw when the game ends in a draw', () => {
            mockDraw.mockReturnValue(true);

            act(() => {
                wrapper.find(TestComponent).props().move('Bb6');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('Bb6');
            expect(mockOnDraw).to.have.beenCalled();
        });

        it('should call onStalemate when the game ends in a stalemate', () => {
            mockStalemate.mockReturnValue(true);

            act(() => {
                wrapper.find(TestComponent).props().move('e7');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('e7');
            expect(mockOnStalemate).to.have.beenCalled();
        });

        it('should call onThreefoldRepetition when the game ends due to threefold repetition', () => {
            mockThreefoldRepetition.mockReturnValue(true);

            act(() => {
                wrapper.find(TestComponent).props().move('Kc1');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('Kc1');
            expect(mockOnThreefoldRepetition).to.have.beenCalled();
        });

        it('should call onInsufficientMaterial when the game ends due to insufficient material', () => {
            mockInsufficientMaterial.mockReturnValue(true);

            act(() => {
                wrapper.find(TestComponent).props().move('Nxa4');
            });

            wrapper.update();

            expect(mockOnLegalMove).to.have.beenCalledWith('Nxa4');
            expect(mockOnInsufficientMaterial).to.have.beenCalled();
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
