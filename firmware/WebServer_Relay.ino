#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>

#ifndef STASSID
#define STASSID "your_wifi_ssid"
#define STAPSK  "your_wifi_pass"
#endif

int internal_led = 1; // internal ESP-01S led
int relay_pin    = 0; // Relay pin
int delay_sec = 1000;
int relay_pin_state = 0;
boolean timer_flag = false;
boolean cycle_flag = false;
unsigned long previousMillis = 0;        // will store start time
unsigned long interval; 
unsigned long interval_next;





const char* ssid = STASSID;
const char* password = STAPSK;

ESP8266WebServer server(80);


void setup(void) {
  pinMode(internal_led, OUTPUT);
  pinMode(relay_pin, OUTPUT);
  
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/toggle_switch.php", toggleSwitch);
  server.on("/set_timer.php",  setTimer);
  server.on("/set_cycle.php",  setCycle);
  server.on("/get_relay_state.php",  getRelayState);

  server.onNotFound(handleNotFound);
  server.begin();
  Serial.println("HTTP server started");
}

void loop(void) {
  server.handleClient();
  tickTimer ();
}
