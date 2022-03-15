const TOOL = {
  Brash: 'Brash',
  Line: 'Line',
  Rubber: 'Rubber',
};

class CanvasBoard {
  constructor(canvas, width = 800, height = 500) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.mousePosition = {
      x: 0,
      y: 0,
    };
    this.color = 'black';
    this.rect = this.canvas.getBoundingClientRect();
    this.lineWidth = 16;
    this.width = width;
    this.height = height;

    this.initBoard();
  }

  initBoard() {
    this.canvas.setAttribute('width', this.width + 'px');
    this.canvas.setAttribute('height', this.height + 'px');
  }

  draw(x, y) {
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  setColor(color) {
    this.color = color;
  }

  setLineWidth(width) {
    this.lineWidth = width;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  clearArea(x, y) {
    this.ctx.clearRect(x, y, this.lineWidth, this.lineWidth);
  }

  drawLine(x, y) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';

    this.ctx.moveTo(this.beginPosition.x, this.beginPosition.y);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.closePath();
  }
}

class Overlay extends CanvasBoard {
  constructor(
    canvas,
    width = 800,
    height = 500,
    board,
    initialTool = TOOL.Brash,
    buttons
  ) {
    super(canvas, width, height);

    this.tool = initialTool;
    this.beginPosition = { x: 0, y: 0 };

    this.buttons = buttons;
    this.board = board;
  }

  initBoard() {
    super.initBoard();

    this.canvas.addEventListener('mousedown', (e) => {
      this.mousePosition = {
        x: e.pageX - this.rect.left,
        y: e.pageY - this.rect.top,
      };

      this.beginPosition = this.mousePosition;
      this.board.beginPosition = this.mousePosition;

      if (this.tool === TOOL.Brash) {
        this.board.beginPath();
        this.ctx.moveTo(this.mousePosition.x, this.mousePosition.y);
      }

      this.isDrawing = true;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDrawing) {
        this.clear();

        const [x, y] = [e.pageX - this.rect.left, e.pageY - this.rect.top];

        switch (this.tool) {
          case TOOL.Brash:
            this.board.draw(x, y);
            break;
          case TOOL.Line:
            this.drawLine(x, y);
            break;
          case TOOL.Rubber:
            this.renderRubber(x - this.lineWidth / 2, y - this.lineWidth / 2);
            this.board.clearArea(x - this.lineWidth / 2, y - this.lineWidth / 2);
          default:
            break;
        }

        this.mousePosition = {
          x: e.clientX - this.rect.left,
          y: e.clientY - this.rect.top,
        };
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.isDrawing = false;
      switch (this.tool) {
        case TOOL.Line:
          this.board.drawLine(
            e.pageX - this.rect.left,
            e.pageY - this.rect.top
          );
          break;
        default:
          break;
      }

      this.clear();
    });
  }

  renderRubber(x, y) {
    this.ctx.lineWidth = '2';
    this.ctx.strokeStyle = '#000000';
    this.ctx.strokeRect(x, y, this.lineWidth, this.lineWidth);
  }

  setColor(color) {
    super.setColor(color);
    this.board.setColor(color);
  }

  setLineWidth(width) {
    super.setLineWidth(width);
    this.board.setLineWidth(width);
  }

  setTool(tool, $button) {
    this.tool = tool;

    this.buttons.forEach(b => {
      b.classList.remove('active')
    });

    $button.classList.add('active');
  }
}

class Board extends CanvasBoard {
  constructor(canvas, width = 800, height = 500) {
    super(canvas, width, height);
  }

  initBoard() {
    super.initBoard();
  }

  beginPath() {
    this.ctx.beginPath();
  }
}

const $clearBtn = document.querySelector('.clear-btn');

const $brushBtn = document.querySelector('.brush');
const $lineBtn = document.querySelector('.line');
const $rubberBtn = document.querySelector('.rubber');

const buttons = [$brushBtn, $lineBtn, $rubberBtn];

$clearBtn.onclick = () => board.clear();
$brushBtn.onclick = () => overlay.setTool(TOOL.Brash, $brushBtn);
$lineBtn.onclick = () => overlay.setTool(TOOL.Line, $lineBtn);
$rubberBtn.onclick = () => overlay.setTool(TOOL.Rubber, $rubberBtn);


const $widthSlider = document.querySelector('.tool-width');
const $colorSelect = document.querySelector('.color-select');

$widthSlider.oninput = (e) => {
  const value = Number(e.target.value);
  overlay.setLineWidth(value);
};

$colorSelect.oninput = (e) => {
  const color = e.target.value;
  overlay.setColor(color);
}

const getInitTool = (type, $domBtn) => {
  $domBtn.classList.add('active');
  return type;
}

const initialSettings = {
  width: 800,
  height: 500,
  initialTool: getInitTool(TOOL.Brash, $brushBtn),
  buttons,
};

const board = new Board(document.getElementById('board'));
const overlay = new Overlay(
  document.getElementById('overlay'),
  initialSettings.width,
  initialSettings.height,
  board,
  initialSettings.initialTool,
  initialSettings.buttons,
);
