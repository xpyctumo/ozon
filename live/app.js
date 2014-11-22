var express = require('express'),
    http = require('http'),
    Socket = require('socket.io'),
    bodyParser = require('body-parser');

var local_port = 4001;
var remote_port = 4002;

// Set up local and remote servers.
var app_remote = express();
var http_remote = http.Server(app_remote);
var io = Socket(http_remote);

var app_local = express();
var http_local = http.Server(app_local);

// Handle local information update.
var current_np = {};
var current_clients = 0;

app_local.use(bodyParser.json({ limit: '50mb' }));

app_local.post('/data', function(req, res) {
    var remote_body = req.body;

    if (remote_body.type == 'nowplaying')
        current_np = remote_body.contents;

    io.emit(remote_body.type, remote_body.contents);

    res.end("yes");
});

app_local.get('/data', function(req, res) {
    res.json({
        'clients': current_clients
    });
});

// Handle remote information publishing.
io.on('connection', function(socket) {
    current_clients++;

    socket.emit('nowplaying', current_np);
});

io.on('disconnection', function(socket) {
    current_clients--;
});

app_remote.get('/', function(req, res) {
    res.send('Ponyville Live! Live Updates API');
});

// Trigger listening on local and remote HTTP servers.
http_local.listen(local_port, 'localhost', function() {
    console.log('Local listening on %d', local_port);
});

http_remote.listen(remote_port, function() {
    console.log('Remote listening on %d', remote_port);
});