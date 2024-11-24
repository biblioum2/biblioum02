// socket.js
let socket;

function connectSocket() {
    if (!socket) {
        socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Connected to server');
        });
        socket.on('message', (data) => {
            console.log('Message from server:', data);
        });
    }
    return socket;
}

// Hacer que la función de conexión y el socket estén disponibles globalmente
window.connectSocket = connectSocket;
window.socket = socket;

// Conectar el socket cuando la ventana se cargue
window.onload = () => {
    window.connectSocket();
};
