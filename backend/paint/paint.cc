#include <iostream>
#include <sstream>
#include <string>
#include "led-matrix.h"
#include "graphics.h"
#include "mylib.h"
#include <vector>
#include <unistd.h>

using rgb_matrix::Canvas;
using rgb_matrix::Color;
using rgb_matrix::Font;
using rgb_matrix::RGBMatrix;

using namespace std;

int main(int argc, char *argv[])
{

	RGBMatrix::Options defaults;
	// defaults.hardware_mapping = "adafruit-hat";  // or e.g. "adafruit-hat"
	// defaults.rows = 64;
	// defaults.cols = 32;
	// defaults.chain_length = 1;
	// defaults.parallel = 1;
	// defaults.show_refresh_rate = false;

	// use --led-slowdown-gpio=4

	Canvas *canvas = rgb_matrix::CreateMatrixFromFlags(&argc, &argv, &defaults);
	if (canvas == NULL)
		return 1;

	int brightness = 1.0;
	Color blue(100 * brightness, 150 * brightness, 255 * brightness);
	Color white(255 * brightness, 255 * brightness, 255 * brightness);
	int scale = 1; // was 2
	rgb_matrix::Font brand_font;
	if (!brand_font.LoadFont("../rpi-rgb-led-matrix/fonts/5x7.bdf"))
	{
		fprintf(stderr, "Couldn't load font \n");
	}
	int letter_spacing = 0;

	Point pos = Point{4, 2};

	draw_logo(canvas, pos, scale, blue, white);

	const char *message = "JENKS";
	// draw_text() defined in mylib.h - canvas, font, row, col etc (opposite of library)
	draw_text(canvas, brand_font, 8 + brand_font.baseline(), 2, blue, Color{0, 0, 0}, const_cast<char *>(message), letter_spacing);
	// draw_text(canvas, brand_font, 38 + brand_font.baseline(),  5, blue, Color{0,0,0}, "NEYTH MAKES", letter_spacing);

	usleep(3000000);

	ResetCanvas(canvas, canvas->height(), canvas->width(), Color(0, 0, 0));

	string python_message = "";
	bool quit = false;
	Point coords;
	Color colour;
	cout << "cpp start  " << endl;

	while (!quit)
	{
		cin >> python_message;

		if (python_message.compare("clear") == 0)
		{
			ResetCanvas(canvas, canvas->height(), canvas->width(), Color(0, 0, 0));
		}

		else if (python_message.compare(0, 3, "msg") == 0)
		{
			ResetCanvas(canvas, canvas->height(), canvas->width(), Color(0, 0, 0));

			string token;
			istringstream ss(python_message);
			getline(ss, token, ',');
			int size = stoi(token);
			getline(ss, token, ',');

			draw_text(canvas, brand_font, brand_font.baseline(), 0, blue, Color{0, 0, 0}, token.data(), letter_spacing);
		}

		// Pixel painting
		else
		{
			string token;
			istringstream ss(python_message);

			vector<int> inputs;

			while (getline(ss, token, ','))
			{
				inputs.push_back(stoi(token));
			}

			for (int i = 0; i < inputs.size() / 5; i++)
			{
				coords = Point{inputs[5 * i], inputs[5 * i + 1]};
				colour = Color{inputs[5 * i + 2] * brightness, inputs[5 * i + 3] * brightness, inputs[5 * i + 4] * brightness};
				SetPixel(canvas, coords, colour);
			}

			/*
			for( int i = 0; i < inputs.size(); i++){
				cout << i << ": "<< inputs[i] << " ";
			}
			cout << endl;

			cout << coords.row << endl;
			cout << coords.col << endl;

			cout << colour.r << " " <<colour.g << " " << colour.b << endl;
			*/
		}
	}
	return 0;
}
