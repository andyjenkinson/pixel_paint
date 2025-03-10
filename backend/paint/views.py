from django.shortcuts import render
from django.http import JsonResponse
import json
import subprocess
import pexpect
from . import state

# Create your views here.
from django.views.decorators.csrf import csrf_exempt

def _send_pixel(col, row, hex):
    # convert hex to rgb    
    r,g,b = tuple(int(hex.lstrip('#')[i:i+2], 16) for i in (0,2,4))
    message = str(row) + ',' + str(col) + ',' + str(r) + ',' + str(g) + ',' + str(b)
    child.sendline(message)

def index(request):
    return render(request, "paint/index.html")


"""
THIS IS WHERE YOU NEED TO ADD THE ARGUMENTS FOR YOUR SPECIFIC MATRIX, I'VE INCLUDED SOME EXAMPLES BELOW

IF YOU DON'T KNOW THE ARGUMENTS I SUGGEST READING THE RGB-RPI LIBRARY DOCUMENTATION AND PLAY AROUND WITH IT UNTIL YOU CAN GET THE DEMOS RUNNING
THEN REPLACE THE STRING BELOW WITH THE ARGUMENTS YOU HAVE TO SUPPLY TO RUN THE DEMOS, WITHOUT THE -D OBVIOUSLY
"""




#Pi 0 with 64x64 matrix and adafruit hat
#rpi_rgb_args = "--led-cols=64 --led-rows=64 --led-gpio-mapping=adafruit-hat --led-slowdown-gpio=0"

#pi 0 with 32x64 matrix and adafruit hat
#rpi_rgb_args = "--led-cols=64 --led-rows=32 --led-gpio-mapping=adafruit-hat --led-slowdown-gpio=0"

cols=64
rows=32
rpi_rgb_args = "--led-cols="+str(cols)+" --led-rows="+str(rows)+" --led-gpio-mapping=adafruit-hat --led-slowdown-gpio=1"

# this line is for my 32x64 matrix using adafruit-hat running on a pi 4 or a pi 3A
#rpi_rgb_args = "--led-cols=64 --led-rows=32 --led-gpio-mapping=adafruit-hat --led-slowdown-gpio=4"

# this line is for my 64x64 matrix using adafruit-hat running on a pi 4 or a pi 3A
#rpi_rgb_args = "--led-cols=64 --led-rows=64 --led-gpio-mapping=adafruit-hat --led-slowdown-gpio=4"

child = pexpect.spawn("paint/paint " + rpi_rgb_args)

matrix_state = state.MatrixState(rows=rows, cols=cols)

# resume last image upon startup
for row in range(rows):
    for col in range(cols):
        colour = matrix_state.pixels[row][col]
        if colour is not None:
            _send_pixel(col, row, colour)

@csrf_exempt
def colour_pixel(request):
    
    data = json.loads(request.body)
    row = data.get("row")
    col = data.get("col")
    colour = data.get("colour")
    
    # write pixel to the LED matrix
    _send_pixel(col, row, colour)

    # record state as we go
    matrix_state.set_pixel(col, row, colour)
    
    return JsonResponse({"message": "Pixel changed."}, status=201)

@csrf_exempt
def get_state(request):
    body = matrix_state.get_state()
    return JsonResponse(body)

@csrf_exempt
def save(request):
    fn = matrix_state.save()
    return JsonResponse({"message": "Saved as "+fn}, status=201)

@csrf_exempt
def text(request):
    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({"message": "Unable to parse JSON: "+str(e)}, status=400)
    size = data.get("size")
    if not size:
       size = 8
    message = data.get("message")
    if not message:
        return JsonResponse({"message": "No message provided"}, status=400)

    child.sendline("msg" + ',' + str(size) + ',' + message)

    return JsonResponse({"message": "Message changed."}, status=201)

@csrf_exempt
def clear(request):
    child.sendline('clear')
    matrix_state.reset()
    return JsonResponse({"message": "Cleared"}, status=201)
