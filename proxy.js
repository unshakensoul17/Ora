const net = require('net');

const LOCAL_PORT = 5433;
// Supabase IPv6 Address
const REMOTE_HOST = '2406:da1a:6b0:f610:8a4d:e925:17c9:a41b';
const REMOTE_PORT = 5432;

const server = net.createServer((socket) => {
    // console.log('New connection from', socket.remoteAddress);

    const client = new net.Socket();

    // Connect to Supabase via IPv6
    client.connect(REMOTE_PORT, REMOTE_HOST, () => {
        socket.pipe(client);
        client.pipe(socket);
    });

    client.on('error', (err) => {
        console.error('Proxy upstream error:', err.message);
        socket.end();
    });

    socket.on('error', (err) => {
        console.error('Proxy client error:', err.message);
        client.end();
    });

    socket.on('close', () => {
        client.end();
    });

    client.on('close', () => {
        socket.end();
    });
});

server.listen(LOCAL_PORT, '127.0.0.1', () => {
    console.log(`TCP Proxy listening on 127.0.0.1:${LOCAL_PORT} -> [${REMOTE_HOST}]:${REMOTE_PORT}`);
});

server.on('error', (err) => {
    console.error('Proxy server error:', err.message);
});
