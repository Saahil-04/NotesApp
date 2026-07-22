const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorMsg = document.getElementById('error-msg');

async function login() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    errorMsg.textContent = '';

    if (!email || !password) {
        errorMsg.textContent = 'Please enter both email and password';
        return;
    }

    loginBtn.disabled = true;
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            errorMsg.textContent = '';
            const data = await response.json();
            const token = data.token;
            localStorage.setItem('token', token);
            window.location.href = '/index.html';
        } else {
            const error = await response.json()
            errorMsg.textContent = error.message
        }

    } catch (error) {
        console.log(error);
        errorMsg.textContent = 'Something Went Wrong! Try Again!';
    } finally {
        loginBtn.disabled = false;
    }
}


loginBtn.addEventListener('click', login)