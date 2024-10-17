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
    }

    window.onload = connectSocket;
