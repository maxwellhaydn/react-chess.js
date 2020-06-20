import { useCallback, useEffect, useReducer, useRef } from 'react';
import { Chess } from 'chess.js';

const useChess = ({ onLegalMove, onIllegalMove, onGameOver } = {}) => {
    const game = useRef(null);

    // Lazily instantiate Chess object only once
    const getGame = () => {
        if (game.current === null) {
            game.current = new Chess();
        }

        return game.current;
    };

    // Clean up Chess object on unmount
    useEffect(() => {
        return () => {
            if (game.current) game.current.destroy();
        };
    }, [game]);

    // Lazily instantiate initial state
    const getInitialState = () => ({
        history: getGame().history(),
        fen: getGame().fen(),
        turn: getGame().turn()
    });

    // Used to update the values of props after every function that mutates the
    // Chess object state
    const reducer = useCallback((state, action) => {
        switch (action.type) {
            case 'update':
                return {
                    history: getGame().history(),
                    fen: getGame().fen(),
                    turn: getGame().turn()
                };
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }, [game]);

    const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

    const makeMove = useCallback((move) => {
        if (getGame().move(move)) {
            dispatch({ type: 'update' });

            if (onLegalMove) onLegalMove(move);
            if (getGame().game_over() && onGameOver) onGameOver();

            return;
        }

        if (onIllegalMove) onIllegalMove(move);

    }, [game, onLegalMove, onIllegalMove, onGameOver]);

    const reset = useCallback(() => {
        getGame().reset();
        dispatch({ type: 'update' });
    }, [game]);

    const undo = useCallback(() => {
        getGame().undo();
        dispatch({ type: 'update' });
    }, [game]);

    return { move: makeMove, reset, undo, ...state };
};

export default useChess;
