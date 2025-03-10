import json
import os.path

DEFAULT_ROWS = 32
DEFAULT_COLS = 64
DEFAULT_SAVE_FN = './saved_state.json'

class MatrixState(object):

    def __init__(self, rows=DEFAULT_ROWS, cols=DEFAULT_COLS):
        self.rows = rows
        self.cols = cols

        if (os.path.isfile(DEFAULT_SAVE_FN)):
            self.load()
        else:
            self.reset()
    
    def reset(self):
        self.mode = 'paint'
        # [
        #  [x,x],
        #  [x,x]
        # ]
        self.pixels = [[None for x in range(self.cols)] for y in range(self.rows)]

    def set_pixel(self, col, row, hex):
        self.pixels[row][col] = hex

    def save(self, fn=DEFAULT_SAVE_FN):
        fh = open(fn, 'w')
        ob = self.get_state()
        json.dump(ob, fh)
        fh.close()
        return fn

    def load(self, fn=DEFAULT_SAVE_FN):
        if (os.path.isfile(fn)):
            fh = open(fn, 'r')
            ob = json.load(fh)
            fh.close()
            self.mode = ob['mode']
            self.pixels = ob['pixels']
        return

    def get_state(self):
        ob = dict()
        ob['mode'] = self.mode
        ob['pixels'] = self.pixels
        return ob