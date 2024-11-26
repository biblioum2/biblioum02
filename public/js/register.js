document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("form").addEventListener("submit", function(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        console.log(formData);
        
        
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });
        console.log(data);


        const errors = {
            username: {
              exist: false,
              valid: true,
              error: [],
            },
            email: {
              exist: false,
              valid: true,
              error: [],
            },
            password: {
              valid: true,
              error: [],
            },
          };
        
          const validateUsername = (username) => {
            const errors = [];
            const minLength = 3;
            const maxLength = 15;
            const validChars = /^[a-z0-9]+$/;
            const trimmedUsername = username.trim();
        
            if (trimmedUsername.length < minLength || trimmedUsername.length > maxLength) {
              errors.push(
                `El nombre de usuario debe tener entre ${minLength} y ${maxLength} caracteres.`
              );
            }
        
            if (!validChars.test(trimmedUsername)) {
              errors.push(
                "El nombre de usuario contiene caracteres no válidos. Solo se permiten letras minúsculas y números."
              );
            }
        
            return {
              valid: errors.length === 0,
              error: errors,
            };
          };
        
          const validateEmail = (email) => {
            const errors = [];
            const emailRegex = /^[a-zA-Z0-9._%+-]+@uman\.edu\.mx$/;
        
            if (!emailRegex.test(email)) {
              errors.push("El formato del correo electrónico no es válido.");
            }
        
            return {
              valid: errors.length === 0,
              error: errors,
            };
          };
        
          const validatePassword = (password, passwordConfirm) => {
            const errors = {
                password1: [],
                password2: [],
          };
            const minLength = 8;
            const maxLength = 20;
            const hasUpperCase = /[A-Z]/;
            const hasLowerCase = /[a-z]/;
            const hasDigit = /\d/;
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
        
            if (password.length < minLength || password.length > maxLength) {
              errors.push(
                `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres.`
              );
            }
        
            if (!hasUpperCase.test(password)) {
              errors.push("La contraseña debe contener al menos una letra mayúscula.");
            }
        
            if (!hasLowerCase.test(password)) {
              errors.push("La contraseña debe contener al menos una letra minúscula.");
            }
        
            if (!hasDigit.test(password)) {
              errors.push("La contraseña debe contener al menos un dígito.");
            }
        
            if (!hasSpecialChar.test(password)) {
              errors.push("La contraseña debe contener al menos un carácter especial.");
            }
            if (password !== passwordConfirm) {
              errors.password2.push("Las contraseñas no coinciden.");                
            }
            return {
              valid: errors.length === 0,
              error: errors,
            };
          };
        

            const username = data.name;
            const email = data.email;
            const password = data.password;
            const passwordConfirm = data.passwordRepeat;
            console.log(username);
            console.log(email);
            console.log(password);
            console.log(passwordConfirm);
            
            if (validateUsername(username).valid === false || validateEmail(email).valid === false || validatePassword(password, passwordConfirm).valid === false) {
                console.log("Error");
                
                const $usernameTooltip = document.getElementById("name-tooltip");
                const $emailTooltip = document.getElementById("email-tooltip");
                const $passwordTooltip = document.getElementById("password-tooltip");
                const $passwordConfirmTooltip = document.getElementById("password-confirm-tooltip");

                $usernameTooltip.innerHTML = "";
                $emailTooltip.innerHTML = "";
                $passwordTooltip.innerHTML = "";
                $passwordConfirmTooltip.innerHTML = "";

                if (validateUsername(username).valid === false) {
                    errors.username.valid = false;
                    errors.username.error = validateUsername(username).error;
                    errors.username.exist = true;
                    $usernameTooltip.innerHTML = errors.username.error.join("<br>"); 
                    $usernameTooltip.style.display = "absolute";                   
                }
                if (validateEmail(email).valid === false) {
                    errors.email.valid = false;
                    errors.email.error = validateEmail(email).error;
                    errors.email.exist = true;
                    $emailTooltip.innerHTML = errors.email.error.join("<br>");
                    emailTooltip.style.display = "absolute";
                }
                if (validatePassword(password, passwordConfirm).valid === false) {
                    errors.password1.valid = false;
                    errors.password1.error = validatePassword(password, passwordConfirm).error;
                    errors.password1.exist = true;
                    $passwordTooltip.innerHTML = errors.password1.error.join("<br>");
                    $passwordTooltip.style.display = "block";
                }
                if (validatePassword(password, passwordConfirm).valid === false) {
                    console.log("Error 2");
                    
                    errors.password2.valid = false;
                    errors.password2.error = validatePassword(password, passwordConfirm).error;
                    errors.password2.exist = true;
                    $passwordConfirmTooltip.innerHTML = errors.password2.error.join("<br>");
                    $passwordConfirmTooltip.classList.add("visible");
                    $passwordConfirmTooltip.classList.remove("ghost");
                }
            }
          

    });
});

