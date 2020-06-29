import { useCallback, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { Chess } from 'chess.js';

const propTypes = {
    onLegalMove: PropTypes.function,
    onIllegalMove: PropTypes.function,
    onGameOver: PropTypes.function,
    onCheck: PropTypes.function,
    onCheckmate: PropTypes.function,
    onDraw: PropTypes.function,
    onStalemate: PropTypes.function,
    onThreefoldRepetition: PropTypes.function,
    onInsufficientMaterial: PropTypes.function,
};

// Callbacks that can be triggered after a legal move, mapped to the
// corresponding chess.js methods that indicate whether they should be triggered
const legalMoveEffects = {
    onGameOver: 'game_over',
    onCheck: 'in_check',
    onCheckmate: 'in_checkmate',
    onDraw: 'in_draw',
    onStalemate: 'in_stalemate',
    onThreefoldRepetition: 'in_threefold_repetition',
    onInsufficientMaterial: 'in_threefold_repetition',
};

const useChess = (props) => {
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

            if (props.onLegalMove) props.onLegalMove(move);

            // Call handlers for check, checkmate, draw, stalemate, etc.
            for (const [handler, method] of Object.entries(legalMoveEffects)) {
                if (props[handler] && getGame()[method]()) {
                    props[handler]();
                }
            }

            return;
        }

        if (props.onIllegalMove) props.onIllegalMove(move);

    }, [game, props]);

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

useChess.propTypes = propTypes;

export default useChess;
