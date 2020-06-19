import { useCallback, useReducer, useRef } from 'react';
import { Chess } from 'chess.js';

const useChess = ({ onLegalMove, onIllegalMove, onGameOver } = {}) => {
    const game = useRef(new Chess());

    const initialState = {
        history: game.current.history(),
        fen: game.current.fen(),
        turn: game.current.turn()
    };

    // Used to update the values of props after every function that mutates the
    // Chess object state
    const reducer = useCallback((state, action) => {
        switch (action.type) {
            case 'update':
                return {
                    history: game.current.history(),
                    fen: game.current.fen(),
                    turn: game.current.turn()
                };
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }, [game]);

    const [state, dispatch] = useReducer(reducer, initialState);

    const makeMove = useCallback((move) => {
        if (game.current.move(move)) {
            dispatch({ type: 'update' });

            if (onLegalMove) onLegalMove(move);
            if (game.current.game_over() && onGameOver) onGameOver();

            return;
        }

        if (onIllegalMove) onIllegalMove(move);

    }, [game, onLegalMove, onIllegalMove, onGameOver]);

    const reset = useCallback(() => {
        game.current.reset();
        dispatch({ type: 'update' });
    }, [game]);

    const undo = useCallback(() => {
        game.current.undo();
        dispatch({ type: 'update' });
    }, [game]);

    return { move: makeMove, reset, undo, ...state };
};

export default useChess;
