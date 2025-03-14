import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { SketchPicker } from 'react-color';


function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};

function Square(props) {
  return (
    <button className="square" onMouseDown={props.onMouseDown} onClick={props.onClick}  onMouseEnter={props.onDrag} onMouseUp={props.onMouseUp} style={{background:props.value}} >
    </button>
  );
}

class ColourPicker extends React.Component {
  state = {
    background: '#ffffff',
  };

  handleChange = (color) => {
    this.setState({ background: color.hex });
  };



  render() {
    return (
      <SketchPicker
        color={this.state.background }
        onChange={ this.handleChange }
        onChangeComplete={ this.props.handleChangeComplete }
      />
    );
  }

}

class Board extends React.Component {

  renderSquare = (i) => {
    return (
      <Square

        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        onMouseUp={() => this.props.onMouseUp()}
        onMouseDown={() => this.props.onMouseDown()}
        onDrag={() => this.props.onDrag(i)}
      />
    );
  }

  renderRow = (row,n_cols) => {
    var indices = range(row*n_cols, (row+1)*n_cols);

    return (
      <div className="board-row" style={"width: "+(n_cols*11)+"px"}>
        {indices.map(this.renderSquare)}
      </div>
    )
  }

  renderRows(n_rows, n_cols){
    var row_indices = range(0, n_rows);
    let rr = this.renderRow;
    return row_indices.map(
      function(row) {return rr(row, n_cols)}
    );

  }

  render() {

    let n_rows = this.props.n_rows;
    let n_cols = this.props.n_cols;
    return (
      this.renderRows(n_rows, n_cols)


      /*
      <div>
        <div className="board-row">
          {this.renderRow(0,10)}
        </div>
        <div className="board-row">
          {this.renderRow(0,10)}
        </div>
        <div className="board-row">
          {this.renderRow(0,10)}
        </div>
      </div>
      */
    );
  }
}





class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      n_rows: 32,
      n_cols: 64,
      colour: "#ffffff",
      history: [{
        squares: Array(16*16).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      mouse_is_down: false
    };


  }
  

  handleColourChange = (colour) =>{
    this.setState({
      colour: colour.hex
    });
  }
  
  
  clear = () => {
    
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      fetch("/clear", {
      method: 'PUT',
      body: JSON.stringify({
        rows: this.state.n_rows,
        cols: this.state.n_cols,
        colour: "#000000"
      })
      })
    for(i=0; i < this.state.n_rows * this.state.n_cols; i++){
      
      squares[i] = "#000000";
      
    
    }
    
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }
  
  handleClick(i){
    this.colour_square(i);
  }

  handleMouseDown() {
    this.setState({
      mouse_is_down: true
    });
    
  }
  
  handleMouseUp() {
    
    this.setState({
      mouse_is_down: false
    });
  }
  
  handleDrag(i) {
    
    if(this.state.mouse_is_down) {
      this.colour_square(i);
    }
  }
  
  colour_square(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();

      squares[i] = this.state.colour;

      this.setState({
        history: history.concat([
          {
            squares: squares
          }
        ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext
      });

      fetch("/colour_pixel", {
        method: 'PUT',
        body: JSON.stringify({
          row: Math.floor(i/this.state.n_cols),
          col: i%this.state.n_cols,
          colour: this.state.colour
        })


      })
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step%2) == 0,
    });
  }

  change_n_rows = (event) => {
    this.setState({
      n_rows: parseInt(event.target.value) ? parseInt(event.target.value) : 1
      /*
      history: [{
        squares: Array(this.n_cols*parseInt(event.target.value)).fill(null),
      }]
      */
    });
  }

  change_n_cols = (event) => {
    this.setState({
      n_cols: parseInt(event.target.value) ? parseInt(event.target.value) : 1
      /*
      history: [{
        squares: Array(this.n_rows*event.target.value).fill(null),
      }]
      */
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
   
     /*
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
        */
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            n_rows={this.state.n_rows}
            n_cols={this.state.n_cols}
            onClick={(i) => this.handleClick(i)}
            onMouseUp={(i) => this.handleMouseUp()}
            onMouseDown={(i) => this.handleMouseDown()}
            onDrag={(i) => this.handleDrag(i)}
          />
        </div>
        
        <div>
          <ColourPicker
            handleChangeComplete={this.handleColourChange}
          />
        </div>
        
       
        <div>
          <div>
            Number of rows:
            <input
              type="number"
              onChange={this.change_n_rows}
              />
          </div>
          <div>
            Number of cols:
            <input
              type="number"
              onChange={this.change_n_cols}
              />
          </div>
        
          <button onClick={this.clear} >Clear</button>
        </div>

      </div>

    );
  }
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
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// ========================================


ReactDOM.render(<Game />, document.getElementById("app"));

