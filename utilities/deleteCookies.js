function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
function sendMessageToUser(userId, message) {
    pool.query('SELECT socket_id FROM users WHERE id = $1', [userId], (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        if (result.rows.length > 0) {
            const socketId = result.rows[0].socket_id;
            // Emitir el mensaje solo si el usuario está conectado
            io.to(socketId).emit('privateMessage', message);
        } else {
            console.log(`Usuario con ID ${userId} no conectado`);
        }
    });
}
module.exports = {
    deleteCookie,
    sendMessageToUser,
};