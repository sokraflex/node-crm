NODE.JS Change Request Manager
==============================

Requirements
------------
You need to install the following components in order to run the CR manager:
 * Node.JS
 * C++ Compiler (included in Visual Studio for Windows)
 * Python 2.x (won't work with 3.x!)

Installation
------------
Open your command line, browse to the cloned or downloaded source code directory and press:
```javascript
npm install
```
To ensure you are in the correct directory, lookup for the "package.json" file.

Startup
-------
Type the following command on your command line to run the demo, using a remote MongoDB server:
```javascript
node index.js
```

In order to use your own database, configure the src/config/config.js accordingly, and restart the server.

Afterwards, browse to `http://localhost:2000`.