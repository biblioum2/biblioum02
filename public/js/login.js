document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        console.log(remember);
        
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, remember })
        });
        const data = await response.json();
        if (data.success === false) {
            alert(data.error);
        } else {
            
            window.location.href = '/';
        }
    });
});