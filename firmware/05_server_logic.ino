
// index page
void handleRoot() {
  server.send(200, "text/html", page_template);
}

// Ajax
void toggleSwitch() {
  relay_pin_state = !relay_pin_state;

  // Stop timer and cycle
  timer_flag = false;
  cycle_flag = false;
  interval = 0;
  interval_next = 0;

  char out[50];
  sprintf(out, "%d", relay_pin_state);
  server.send(200, "text/html", out);

  digitalWrite (relay_pin , relay_pin_state);
}

// Set timer
void setTimer() {
  interval = server.arg("time_0").toInt() * 60000;
  interval_next = 0;
  timer_flag = true;
  cycle_flag = false;
  previousMillis = millis();
  server.send(200, "text/html", "1");
}

// Set cycle
void setCycle () {
  interval = server.arg("time_1").toInt() * 60000;
  interval_next = server.arg("time_2").toInt() * 60000;
  timer_flag = true;
  cycle_flag = true;
  previousMillis = millis();
  server.send(200, "text/html", "1");
}


void getRelayState() {
  unsigned long time_left;
  int work_mode = 0;
  if (timer_flag) {
    unsigned long currentMillis = millis();
    time_left = interval - (currentMillis - previousMillis);
  }
  else {
    time_left = 0;
  }

  if (cycle_flag)
    work_mode = 1;

  char out[100];
  sprintf(out, "%d,%d,%d,%d,%d", relay_pin_state, time_left, interval, interval_next, work_mode);

  server.send(200, "text/html", out );
}




void tickTimer () {
  if (timer_flag) {
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= interval) {
      timer_flag = false;
      relay_pin_state = !relay_pin_state;
      digitalWrite (relay_pin , relay_pin_state); // Turn off

      if (cycle_flag) {
        unsigned long interval_prev = interval;
        previousMillis = millis();
        timer_flag = true;
        interval = interval_next;
        interval_next = interval_prev;
      }
    }
  }
}


// 404 error
void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}
