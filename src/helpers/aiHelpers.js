export function randomMove(squares, aiSymbol) {
  const availableMoves = squares
    .map((square, index) => (square === null ? index : null))
    .filter((index) => index !== null);
  const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  const newSquares = squares.slice();
  newSquares[randomMove] = aiSymbol;
  return newSquares;
}

export function blockingMove(squares, playerSymbol, aiSymbol) {
  const availableMoves = squares
    .map((square, index) => (square === null ? index : null))
    .filter((index) => index !== null);

  for (let index of availableMoves) {
    const testSquares = squares.slice();
    testSquares[index] = aiSymbol;
    if (calculateWinner(testSquares) === aiSymbol) {
      testSquares[index] = aiSymbol;
      return testSquares;
    }
  }

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

export function minimax(squares, isMaximizing, aiSymbol, playerSymbol, depth = 0) {
  const winner = calculateWinner(squares);
  
  if (winner === aiSymbol) return { score: 10 - depth };
  if (winner === playerSymbol) return { score: depth - 10 };
  if (squares.every(Boolean)) return { score: 0 };

  const availableMoves = squares
      .map((square, index) => square === null ? index : null)
      .filter(index => index !== null);

  if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove = null;
      
      for (const index of availableMoves) {
          const newSquares = [...squares];
          newSquares[index] = aiSymbol;
          if (calculateWinner(newSquares) === aiSymbol) {
              return { index, score: 10 - depth };
          }
      }
      
      for (const index of availableMoves) {
          const newSquares = [...squares];
          newSquares[index] = aiSymbol;
          const result = minimax(newSquares, false, aiSymbol, playerSymbol, depth + 1);
          if (result.score > bestScore) {
              bestScore = result.score;
              bestMove = index;
          }
      }
      return { index: bestMove, score: bestScore };
  } else {
      let bestScore = Infinity;
      let bestMove = null;
      
      for (const index of availableMoves) {
          const newSquares = [...squares];
          newSquares[index] = playerSymbol;
          if (calculateWinner(newSquares) === playerSymbol) {
              return { index, score: depth - 10 };
          }
      }
      
      for (const index of availableMoves) {
          const newSquares = [...squares];
          newSquares[index] = playerSymbol;
          const result = minimax(newSquares, true, aiSymbol, playerSymbol, depth + 1);
          if (result.score < bestScore) {
              bestScore = result.score;
              bestMove = index;
          }
      }
      return { index: bestMove, score: bestScore };
  }
}

export function minimaxMove(squares, aiSymbol, playerSymbol) {
  if (squares.every((square) => square === null)) {
    const randomMove = Math.floor(Math.random() * squares.length);
    const newSquares = squares.slice();
    newSquares[randomMove] = aiSymbol;
    return newSquares;
  }
  const bestMove = minimax(squares, true, aiSymbol, playerSymbol);
  console.log(bestMove);
  const newSquares = squares.slice();
  newSquares[bestMove.index] = aiSymbol;
  return newSquares;
}

export function calculateWinner(squares) {
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
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}