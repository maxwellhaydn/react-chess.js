import React, { useCallback, useState } from 'react';
import { Chess } from 'chess.js';

const useChess = ({ onLegalMove, onIllegalMove, onGameOver } = {}) => {
    const [game, setGame] = useState(new Chess());
    const [history, setHistory] = useState([]);

    const makeMove = useCallback((move) => {
        if (game.move(move)) {
            setHistory(game.history());

            if (onLegalMove) onLegalMove(move);
            if (game.game_over() && onGameOver) onGameOver();

            return;
        }

        if (onIllegalMove) onIllegalMove(move);
    }, [game, onGameOver, onLegalMove, onIllegalMove, setHistory]);

    return { move: makeMove, history };
};

export { useChess };
