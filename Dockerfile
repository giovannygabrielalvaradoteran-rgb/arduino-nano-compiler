FROM node:20-slim

RUN apt-get update && apt-get install -y curl python3 && rm -rf /var/lib/apt/lists/*

# Instalar arduino-cli
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Instalar core AVR (Arduino Nano) y todas las librerias de tus bloques
RUN arduino-cli core update-index && \
    arduino-cli core install arduino:avr && \
    arduino-cli lib install \
      "Servo" \
      "DHT sensor library" \
      "Adafruit Unified Sensor" \
      "Adafruit BMP280 Library" \
      "Adafruit_VL53L0X" \
      "MFRC522" \
      "LiquidCrystal I2C" \
      "Adafruit SSD1306" \
      "Adafruit GFX Library" \
      "Adafruit NeoPixel"

WORKDIR /app
COPY package.json server.js ./
RUN npm install

EXPOSE 3000
CMD ["node", "server.js"]
