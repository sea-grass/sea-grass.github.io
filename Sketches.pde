int frame = 0;
void setup() {
  int x, radius, level;
  size(200, 200);
  
  randomizePixels();
}

void draw() {
  frame++;
  
  if (frame % 20 == 0 || frame % 13 == 0) {
    randomizePixels();
  }
  drawArc(mouseX, height / 2, 0, PI / 2.0);
}

void randomizePixels() {
  loadPixels();
  
  for (int i = 0; i < pixels.length; i++) {
    float rand = random(255) % 70 + 160;
    color c = color(rand);
    
    pixels[i] = c;
  }
  
  updatePixels();
}

drawArc(int x, int y, int start, int stop) {
  stroke(128);
  arc(x, y, start, stop);
}