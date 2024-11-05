import React, { useState, useEffect } from "react";
import lightIcon from "./icons/light-icon.svg";
import darkIcon from "./icons/dark-icon.svg";

export default function Game() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [aiSymbol, setAiSymbol] = useState(null);
  const [playerIsNext, setPlayerIsNext] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Choose your symbol");
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isDarkMode") === "true") {
      document.body.classList.add("dark-mode");
      setIsDarkMode(true);
    }

    if (playerIsNext === true) {
      setStatusMessage(`Player's turn (${playerSymbol})`);
    } else if (playerIsNext === false) {
      setStatusMessage(`AI's turn (${aiSymbol})`);
      handleAiMove();
    }
  }, [playerIsNext]);

  useEffect(() => {
    if (gamesPlayed > 0 && gamesPlayed % 5 === 0 && difficultyLevel < 3) {
      setDifficultyLevel(difficultyLevel + 1);
    }
  }, [gamesPlayed, difficultyLevel]);

  function handleSymbolChoice(symbol) {
    setPlayerSymbol(symbol);
    setAiSymbol(symbol === "X" ? "O" : "X");
    setPlayerIsNext(Math.random() < 0.5);
  }

  function changeStatusMessage(playerIsNext, winner) {
    if (winner) {
      if (winner === playerSymbol) {
        setStatusMessage("You won!");
      } else {
        setStatusMessage("You lost!");
      }
    } else if (!squares.includes(null)) {
      setStatusMessage("Draw!");
    } else {
      setStatusMessage(
        playerIsNext
          ? `Player's turn (${playerSymbol})`
          : `AI's turn (${aiSymbol})`
      );
    }
  }

  function aiMove(squares, playerSymbol, aiSymbol) {
    if (difficultyLevel === 1) return randomMove(squares, aiSymbol);
    if (difficultyLevel === 2)
      return blockingMove(squares, playerSymbol, aiSymbol);

    return minimaxMove(squares, aiSymbol, playerSymbol);
  }

  function handleAiMove() {
    if (
      playerIsNext ||
      calculateWinner(squares) ||
      squares.every((square) => square !== null)
    )
      return;

    const aiMoveTimeout = setTimeout(() => {
      const aiSquares = aiMove(squares, playerSymbol, aiSymbol);
      setSquares(aiSquares);

      if (calculateWinner(aiSquares) === aiSymbol) {
        setStatusMessage("You lost.");
        setGamesPlayed(gamesPlayed + 1);
      } else {
        changeStatusMessage(playerIsNext, null);
        setPlayerIsNext(true);
      }
    }, 1200);

    return () => clearTimeout(aiMoveTimeout);
  }

  function handlePlayerMove(index) {
    if (playerIsNext === false || squares[index] || calculateWinner(squares))
      return;

    const newSquares = squares.slice();
    newSquares[index] = playerIsNext ? playerSymbol : aiSymbol;
    setSquares(newSquares);
    if (calculateWinner(newSquares) === playerSymbol) {
      setStatusMessage("You won!");
      setGamesPlayed(gamesPlayed + 1);
    } else {
      setPlayerIsNext(false);
    }
  }

  function randomMove(squares, aiSymbol) {
    const availableMoves = squares
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null);

    const randomMove =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const newSquares = squares.slice();
    newSquares[randomMove] = aiSymbol;

    return newSquares;
  }

  function blockingMove(squares, playerSymbol, aiSymbol) {
    const availableMoves = squares
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null);

    for (let index of availableMoves) {
      const testSquares = squares.slice();
      testSquares[index] = playerSymbol;
      if (calculateWinner(testSquares) === playerSymbol) {
        testSquares[index] = aiSymbol;
        return testSquares;
      }
    }

    return randomMove(squares, aiSymbol);
  }

  function minimaxMove(squares, aiSymbol) {
    const bestMove = minimax(squares, aiSymbol);
    const newSquares = squares.slice();
    newSquares[bestMove] = aiSymbol;
    return newSquares;
  }

  function minimax(squares, currentPlayer) {
    const opponent = currentPlayer === "X" ? "O" : "X";
    const winner = calculateWinner(squares);

    if (winner === currentPlayer) return { score: 1 };
    if (winner === opponent) return { score: -1 };
    if (squares.every(Boolean)) return { score: 0 };

    let moves = [];
    squares.forEach((square, index) => {
      if (!square) {
        const newSquares = squares.slice();
        newSquares[index] = currentPlayer;
        const result = minimax(newSquares, opponent);
        moves.push({ index, score: -result.score });
      }
    });

    const bestMove = moves.reduce((best, move) =>
      move.score > best.score ? move : best
    );
    return bestMove.index;
  }

  function gameReset() {
    setSquares(Array(9).fill(null));
    setPlayerSymbol(null);
    setAiSymbol(null);
    setPlayerIsNext(null);
    setStatusMessage("Choose your symbol");
  }

  function aiReset() {
    setGamesPlayed(0);
    setDifficultyLevel(1);
  }

  function toggleDarkMode() {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
      localStorage.setItem("isDarkMode", newMode);
      return newMode;
    });
  }

  if (!playerSymbol) {
    return (
      <>
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          <img src={isDarkMode ? lightIcon : darkIcon} alt="Toggle theme" />
        </button>
        <div className="symbol-choice">
          <h2>Choose your symbol</h2>
          <div className="symbol-buttons">
            <button onClick={() => handleSymbolChoice("X")}>X</button>
            <button onClick={() => handleSymbolChoice("O")}>O</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="game">
      <button onClick={toggleDarkMode} className="dark-mode-toggle">
        <img src={isDarkMode ? lightIcon : darkIcon} alt="Toggle theme" />
      </button>
      <div className="game-board">
        <div className="status">
          <h1>{statusMessage}</h1>
        </div>
        <Board squares={squares} onPlay={handlePlayerMove} />
      </div>
      <div className="game-controls">
        <button onClick={() => gameReset()}>Restart</button>
        <button onClick={() => {
          aiReset();
          gameReset();
        }}>Reset AI Difficulty</button>
      </div>
    </div>
  );
}

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ squares, onPlay }) {
  function handleClick(i) {
    onPlay(i);
  }

  return (
    <>
      <div className="row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
