#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

const char* ssid = "TALKTALK8A650B";
const char* password = "8XY9Y4KJ";

ESP8266WebServer server(80);

const int led = BUILTIN_LED;
int ledvalue = 0;

void handleRoot() {
  digitalWrite(BUILTIN_LED, 1);
  server.send(200, "text/plain", "hello from esp8266!");
  digitalWrite(BUILTIN_LED, 0);
}

void ledON() {
  if(server.hasArg("value"))
  {

    server.send(200, "text/plain", "led on"+server.arg("value"));
    ledvalue = server.arg("value").toInt();
  }else {
    server.send(200, "text/plain", "led on");
    ledvalue=255;
  }
}

void ledOFF() {
  server.send(200, "text/plain", "led off");
  ledvalue=0;
}

void handleNotFound(){
  digitalWrite(BUILTIN_LED, 1);
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET)?"GET":"POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i=0; i<server.args(); i++){
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
  digitalWrite(BUILTIN_LED, 0);
}

void setup(void){  
  pinMode(BUILTIN_LED, OUTPUT); 
  digitalWrite(BUILTIN_LED, 0);
  //Serial.begin(115200);
  WiFi.begin(ssid, password);
  //Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    //Serial.print(".");
  }
  //Serial.println("");
  //Serial.print("Connected to ");
  //Serial.println(ssid);
  //Serial.print("IP address: ");
  //Serial.println(WiFi.localIP());

  if (MDNS.begin("esp8266")) {
    //Serial.println("MDNS responder started");
  }

  server.on("/LED/ON", ledON);
  server.on("/LED/OFF", ledOFF);

  server.on("/inline", [](){
    server.send(200, "text/plain", "this works as well");
  });

  server.onNotFound(handleNotFound);

  server.begin();
  //Serial.println("HTTP server started");
  digitalWrite(BUILTIN_LED, 1);
}

void loop(void){
  server.handleClient();
  analogWrite(BUILTIN_LED, ledvalue);
}
