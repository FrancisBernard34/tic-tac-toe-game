import React, { useState, useEffect } from "react";
import lightIcon from "./icons/light-icon.svg";
import darkIcon from "./icons/dark-icon.svg";

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [aiSymbol, setAiSymbol] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [xIsNext, setXIsNext] = useState(null);
  const currentSquares = history[currentMove];

  useEffect(() => {
    if (aiSymbol && !xIsNext && !calculateWinner(currentSquares)) {
      const aiSquares = aiMove(currentSquares);
      handlePlay(aiSquares);
    }

    if (localStorage.getItem("isDarkMode") === "true") {
      document.body.classList.add("dark-mode");
      setIsDarkMode(true);
    }
  }, [aiSymbol, xIsNext, currentSquares]);

  function handleSymbolChoice(symbol) {
    setPlayerSymbol(symbol);
    setAiSymbol(symbol === "X" ? "O" : "X");
    const firstMove = Math.random() < 0.5;
    setXIsNext(firstMove);
  }

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
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

  const moves = history.map((_, move) => {
    let description;
    if (move > 0) {
      description = `Go to move #${move}`;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  if (!playerSymbol) {
    return (
      <>
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          <img src={isDarkMode ? lightIcon : darkIcon} alt="Toggle theme" />
        </button>
        <div className="symbol-choice">
          <h2>Choose your symbol</h2>
          <button onClick={() => handleSymbolChoice("X")}>X</button>
          <button onClick={() => handleSymbolChoice("O")}>O</button>
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
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} playerSymbol={playerSymbol} />
      </div>
      <div>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function aiMove(squares) {
  const availableMoves = squares
    .map((square, index) => (square === null ? index : null))
    .filter(element => element !== null);

  const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  const newSquares = squares.slice();
  newSquares[randomMove] = "O";
  return newSquares;
}

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, playerSymbol }) {
  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else {
    status = `Next Player: ${xIsNext ? (playerSymbol === "X" ? "X" : "O") : (playerSymbol === "X" ? "O" : "X")}`;
  }

  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? playerSymbol : (playerSymbol === "X" ? "O" : "X");
    onPlay(nextSquares);
  }

  return (
    <>
      <div className="status">
        <h1>{status}</h1>
      </div>
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
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
