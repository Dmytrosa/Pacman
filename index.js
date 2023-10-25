const aStar = ({ r, c }, baseCell) => {
  const openList = [baseCell];
  const closedList = [];
  const goalCell = grid[getIndex(r, c)];
  let currentCell;
  const path = [];

  for (const i in grid) {
    grid[i].cost = Infinity;
    grid[i].heuristic = 0;
    grid[i].parent = undefined;
  }
  baseCell.cost = 0;
  while (openList.length > 0) {
    openList.sort((x, y) => x.f - y.f);
    currentCell = openList.shift();

    if (currentCell == goalCell) {
      break;
    }

    closedList.push(currentCell);
    for (const n of currentCell.neighbors) {
      if (closedList.includes(n)) continue;

      n.heuristic = manhattanDistance(n, goalCell);
      const recalculatedCellCost = currentCell.cost + 1;

      if (!openList.includes(n)) {
        openList.push(n);
      } else if (recalculatedCellCost >= n.cost) {
        continue;
      }
      n.parent = currentCell;
      n.cost = recalculatedCellCost;
      n.f = n.cost + n.heuristic;
    }
  }
  while (currentCell) {
    path.unshift(currentCell);
    currentCell = currentCell.parent;
  }
  return { path, closedList };
};
const greedySearch = ({ r, c }, baseCell) => {
  const openList = [baseCell];
  const closedList = [];
  const goalCell = grid[getIndex(r, c)];
  const path = [];
  let currentCell;

  for (const i in grid) {
    grid[i].heuristic = manhattanDistance(grid[i], goalCell);
    grid[i].parent = undefined;
    grid[i].cost = 0;
  }
  while (openList.length > 0) {
    openList.sort((x, y) => x.heuristic - y.heuristic);
    currentCell = openList.shift();

    if (currentCell == goalCell) {
      break;
    }

    closedList.push(currentCell);
    for (const n of currentCell.neighbors) {
      if (closedList.includes(n)) continue;

      const recalculatedCellCost = currentCell.cost + 1;
      if (!openList.includes(n)) {
        openList.push(n);
      } else if (recalculatedCellCost >= n.cost) {
        continue;
      }
      n.parent = currentCell;
      n.cost = recalculatedCellCost;
      n.heuristic = manhattanDistance(n, goalCell);
    }
  }
  while (currentCell) {
    path.unshift(currentCell);
    currentCell = currentCell.parent;
  }
  return { path, closedList };
};

function Enemy(r, c) {
  this.r = r;
  this.c = c;
  this.prevr = r;
  this.prevc = c;
  this.x = c * size;
  this.y = r * size;
  this.dir = {
    x: 0,
    y: 0,
  };
  this.cell = grid[getIndex(r, c)];

  this.update = function (cell) {
    this.dir = getDirection(this, cell);
    this.cell = cell;
    this.prevr = this.r;
    this.prevc = this.c;
    this.r = cell.r;
    this.c = cell.c;
    this.x = this.prevc * size;
    this.y = this.prevr * size;
  };

  this.step = function () {
    this.x = this.x + (this.dir.x * size) / updateFrequency;
    this.y = this.y + (this.dir.y * size) / updateFrequency;
  };

  this.findPath = function (r, c, algorithm) {
    return this[algorithm](r, c);
  };

  this.AStar = (r, c) => {
    return aStar({ r, c }, this.cell);
  };

  this.greedySearch = (r, c) => {
    return greedySearch({ r, c }, this.cell);
  };

  const showEnemy = (aStarEnemyTheme, enemyName) => {
    fill(aStarEnemyTheme);
    textSize(32);
    text(enemyName, this.x, this.y);
    noStroke();
    ellipse(this.x + size / 2, this.y + size / 2, size * 0.5);
  };
  this.show = () => showEnemy(theme.aStarEnemy, "AStar");
  this.show1 = () => showEnemy(theme.greedyEnemy, "Greedy");
}

function showCoins() {
  for (const i in coins) {
    if (coins[i] === true) {
      noStroke();
      fill(theme.player);
      ellipse(
        grid[i].c * size + size / 2,
        grid[i].r * size + size / 2,
        size / 6
      );
    }
  }
}

function randomMap() {
  for (const cell of grid) {
    let n = cell.checkNeighbors();
    if (n) removeWalls(cell, n);
  }
}

function maze() {
  while (true) {
    current.visited = true;
    let next = current.checkNeighbors();
    if (next) {
      stack.push(current);
      removeWalls(current, next);
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else {
      for (const cell of grid) {
        cell.visited = false;
      }
      break;
    }
  }
}

function removeWalls(a, b) {
  let x = a.c - b.c;
  let y = a.r - b.r;

  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  }
  if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }

  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

function showPath(path, closedList) {
  // strokeWeight(size / 8);
  // stroke(theme.path);
  // beginShape();
  // noFill();
  // for (const cell of closedList) {
  //   vertex(cell.c * size + size / 2, cell.r * size + size / 2);
  // }
  // endShape();
  // noLoop();

  strokeWeight(size / 8);
  stroke(theme.path);
  beginShape();
  noFill();
  for (const cell of path) {
    vertex(cell.c * size + size / 2, cell.r * size + size / 2);
  }
  endShape();
}

function getDirection(c1, c2) {
  let x = c2.c - c1.c;
  let y = c2.r - c1.r;
  return { x, y };
}

function highlightCells(cells) {
  for (const cell of cells) {
    let x = cell.c * size;
    let y = cell.r * size;
    noStroke();
    fill(0, 255, 255, 60);
    rect(x, y, size, size);
  }
}

function areNeighbors(c1, c2) {
  if (c1 && c2) {
    for (const n of c1.neighbors) {
      if (n == c2) return true;
    }
  }
  return false;
}

function getIndex(r, c) {
  if (c > cols - 1 || r > rows - 1 || r < 0 || c < 0) return -1;
  return c + cols * r;
}

function manhattanDistance(c1, c2) {
  return abs(c1.c - c2.c) + abs(c1.r - c2.r);
}
function Cell(r, c) {
  this.c = c;
  this.r = r;
  this.walls = [true, true, true, true];
  this.visited = false;
  this.neighbors = [];
  this.cost = 0;

  this.show = function (s, c) {
    let w = size;
    let x = this.c * w;
    let y = this.r * w;

    stroke(c);
    strokeWeight(s);

    if (this.walls[0]) line(x, y, x + w, y);
    if (this.walls[1]) line(x + w, y, x + w, y + w);
    if (this.walls[2]) line(x, y + w, x + w, y + w);
    if (this.walls[3]) line(x, y, x, y + w);
  };

  this.checkNeighbors = function () {
    let neighbors = [];

    let top = grid[getIndex(this.r - 1, this.c)];
    let right = grid[getIndex(this.r, this.c + 1)];
    let bottom = grid[getIndex(this.r + 1, this.c)];
    let left = grid[getIndex(this.r, this.c - 1)];

    top && !top.visited && neighbors.push(top);
    right && !right.visited && neighbors.push(right);
    bottom && !bottom.visited && neighbors.push(bottom);
    left && !left.visited && neighbors.push(left);

    let rIndex = floor(random() * neighbors.length);
    n = neighbors[rIndex];
    if (n) {
      let alreadyNeigbor = false;
      for (const neighbor of this.neighbors) {
        if (n == neighbor) {
          alreadyNeigbor = true;
        }
      }
      if (!alreadyNeigbor) {
        this.neighbors.push(n);
        n.neighbors.push(this);
      }
    }
    return n;
  };
}
function Player() {
  this.cell = goal.c + goal.r * rows;
  this.x = goal.c * size + size / 2;
  this.y = goal.r * size + size / 2;
  this.s = size / updateFrequency;
  this.dir = {
    x: 0,
    y: 0,
  };
  this.show = function () {
    fill(theme.player);
    noStroke();
    ellipse(this.x, this.y, size / 2);
  };

  this.update = function () {
    let currentIndex = getIndex(
      round((this.y - size / 2) / size),
      round((this.x - size / 2) / size)
    );
    let currentCell = grid[currentIndex];
    this.cell = currentIndex;
    let nextIndex = getIndex(
      round((this.y - size / 2) / size) + this.dir.y,
      round((this.x - size / 2) / size) + this.dir.x
    );
    let nextCell = grid[nextIndex];

    if (!areNeighbors(currentCell, nextCell)) {
      this.dir.x = 0;
      this.dir.y = 0;
    }

    if (coins[currentIndex]) {
      score++;
      coins[currentIndex] = false;
    }

    this.x += this.dir.x * this.s;
    this.y += this.dir.y * this.s;

    if (!(this.x - size / 2 > 0 && this.x - size / 2 < width - size)) {
      this.dir.x = 0;
    }
    if (!(this.y - size / 2 > 0 && this.y - size / 2 < height - size)) {
      this.dir.y = 0;
    }

    if (this.dir.x == 0) {
      this.x = lerp(this.x, currentCell.c * size + size / 2, 0.5);
    }
    if (this.dir.y == 0) {
      this.y = lerp(this.y, currentCell.r * size + size / 2, 0.5);
    }
  };
}

let cols, rows, path1, path, scoreStr, current, goal, theme, player;
let size = 30;
let grid = [];
let stack = [];
let coins = [];
let score = -1;
let realTime = true;
let framerate = 60;
let frameCount = 0;
let updateFrequency = 15;
let exploredCells = [];

let search = "AStar";
let geeedy = "greedySearch";

function setup() {
  createCanvas(480, 480);
  cols = floor(width / size);
  rows = floor(height / size);

  theme = {
    background: color(0),
    walls: color(0, 0, 255),
    goal: color(255, 255, 0),
    player: color(255, 255, 0),
    path: color(255, 184, 222, 120),
    aStarEnemy: color(255, 184, 222),
    greedyEnemy: color(255, 14, 22),
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.push(new Cell(r, c));
      coins.push(!Math.floor(Math.random() * 3));
    }
  }

  current = grid[0];
  goal = grid[grid.length - 1];
  maze();
  randomMap(true);

  aStarEnemy = new Enemy(0, 0);
  greedyEnemy = new Enemy(0, 0);

  player = new Player();
  scoreStr = createP("Score: " + score);
}

function draw() {
  background(theme.background);
  highlightCells(exploredCells);
  player.update();
  player.show();
  showCoins();
  scoreStr.html("Score: " + score);

  for (const cell of grid) {
    cell.show(size / 4, theme.walls);
  }

  for (const cell of grid) {
    cell.show(size / 4 - 2, theme.background);
  }

  aStarEnemy.step();
  aStarEnemy.show();
  greedyEnemy.step();
  greedyEnemy.show1();

  let closedList1 = [];
  let closedList2 = [];
  if (frameCount % updateFrequency == 0) {
    path = aStarEnemy.findPath(goal.r, goal.c, search).path;
    path1 = greedyEnemy.findPath(goal.r, goal.c, geeedy).path;
    closedList1 = aStarEnemy.findPath(goal.r, goal.c, search).closedList;
    closedList2 = greedyEnemy.findPath(goal.r, goal.c, geeedy).closedList;

    let newCell = path[1];
    let newCell1 = path1[1];

    if (newCell && newCell1) {
      aStarEnemy.update(newCell);
      greedyEnemy.update(newCell1);
    } else {
      alert("Game over, your score is: " + score + "\nTry again!");
      window.location.reload();
    }
  }

  if (realTime) {
    let r, c;
    c = floor(min(player.x, width) / size);
    r = floor(min(player.y, height) / size);
    if (grid[getIndex(r, c)]) {
      goal = grid[getIndex(r, c)];
    }
  }
  frameCount = (frameCount + 1) % framerate;

  showPath(path, closedList1);
  showPath(path1, []);
}

keyPressed = function () {
  if (keyCode === ENTER) {
    loop();
  }
  if (keyCode === ESCAPE) {
    noLoop();
  } else {
    if (keyCode === LEFT_ARROW) {
      player.dir = { x: -1, y: 0 };
    } else if (keyCode === RIGHT_ARROW) {
      player.dir = { x: 1, y: 0 };
    } else if (keyCode === UP_ARROW) {
      player.dir = { x: 0, y: -1 };
    } else if (keyCode === DOWN_ARROW) {
      player.dir = { x: 0, y: 1 };
    }
  }
};
