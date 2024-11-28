document.addEventListener("DOMContentLoaded", async function () {
  let sentFormCount = 0;

  document
    .getElementById("form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      function showTooltip(tooltipElement) {
        tooltipElement.style.display = "block";
      }

      function hideTooltip(tooltipElement) {
        tooltipElement.style.display = "none";
      }

      function setupTooltip(input, tooltip) {
        const show = () => showTooltip(tooltip);
        const hide = () => hideTooltip(tooltip);

        input.addEventListener("focusin", show);
        input.addEventListener("focusout", hide);

        // Asocia las funciones al input para poder eliminarlas más tarde
        input._show = show;
        input._hide = hide;
      }

      function removeTooltipEvents(input) {
        if (input._show && input._hide) {
          input.removeEventListener("focusin", input._show);
          input.removeEventListener("focusout", input._hide);
        }
      }
      const $usernameTooltip = document.getElementById("name-tooltip");
      const $emailTooltip = document.getElementById("email-tooltip");
      const $passwordTooltip = document.getElementById("password-tooltip");
      const $passwordConfirmTooltip = document.getElementById(
        "password-confirm-tooltip"
      );
      const $inputs = document.querySelectorAll("input");
      const $alertUsername = document.getElementById("alert-name");
      const $alertEmail = document.getElementById("alert-email");
      const $alertPassword1 = document.getElementById("alert-password1");
      const $alertPassword2 = document.getElementById("alert-password2");
      const $inputName = $inputs[0];
      const $inputEmail = $inputs[1];
      const $inputPassword1 = $inputs[2];
      const $inputPassword2 = $inputs[3];

      const hasevents = {
        username: false,
        email: false,
        password1: false,
        password2: false,
      };

      const formData = new FormData(event.target);

      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

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
          valid: {
            password1: true,
            password2: true,
          },
          error: {},
        },
      };

      const validateUsername = (username) => {
        const errors = [];
        const minLength = 3;
        const maxLength = 15;
        const validChars = /^[a-z0-9]+$/;
        const trimmedUsername = username.trim();

        if (
          trimmedUsername.length < minLength ||
          trimmedUsername.length > maxLength
        ) {
          errors.push(
            `El nombre de usuario debe tener entre ${minLength} y ${maxLength} caracteres.`
          );
        }

        if (!validChars.test(trimmedUsername)) {
          errors.push(
            "El nombre de usuario contiene caracteres no válidos. Solo se permiten letras minúsculas y números."
          );
        }

        return errors;
      };

      const validateEmail = (email) => {
        const errors = [];
        const emailRegex = /^[a-zA-Z0-9._%+-]+@uman\.edu\.mx$/;

        if (!emailRegex.test(email)) {
          errors.push(
            "Correo electronico no valido, utiliza tu correo institucional."
          );
        }

        return errors;
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
          errors.password1.push(
            `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres.`
          );
        }

        if (!hasUpperCase.test(password)) {
          errors.password1.push(
            "La contraseña debe contener al menos una letra mayúscula."
          );
        }

        if (!hasLowerCase.test(password)) {
          errors.password1.push(
            "La contraseña debe contener al menos una letra minúscula."
          );
        }

        if (!hasDigit.test(password)) {
          errors.password1.push(
            "La contraseña debe contener al menos un dígito."
          );
        }

        if (!hasSpecialChar.test(password)) {
          errors.password1.push(
            "La contraseña debe contener al menos un carácter especial."
          );
        }
        if (password !== passwordConfirm) {
          errors.password2.push("Las contraseñas no coinciden.");
        }
        return errors;
      };

      const username = data.name.trim();
      const email = data.email.trim();
      const password = data.password.trim();
      const passwordConfirm = data.passwordRepeat.trim();

      errors.username.error.push(validateUsername(username));
      errors.username.valid = errors.username.error[0].length === 0;

      errors.email.error.push(validateEmail(email));
      errors.email.valid = errors.email.error[0].length === 0;

      const passwordErrors = validatePassword(password, passwordConfirm);
      errors.password.error.password1 = passwordErrors.password1;
      errors.password.error.password2 = passwordErrors.password2;
      errors.password.valid.password1 =
        errors.password.error.password1.length === 0;
      errors.password.valid.password2 =
        errors.password.error.password2.length === 0;

      if (
        errors.username.valid &&
        errors.email.valid &&
        errors.password.valid.password1 &&
        errors.password.valid.password2
      ) {
        try {
          fetch("/registerUser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
            .then((response) => {
              if (response.ok) {
                window.location.href = "/login";
              } else {
                return response.json();
              }
            })
            .then((data) => {
              const errorsServer = data.errors;
              if (errorsServer.email.exist === true || errorsServer.username.exist === true) {
                $inputs.forEach((element) => {
                  element.blur();
                });

                if (errorsServer.username.exist === true) {
                  $alertUsername.style.display = "block";
                  $usernameTooltip.innerHTML = errorsServer.username.error;
                }      

                if (errorsServer.username.valid === false) {
                  if (hasevents.username === false) {
                    setupTooltip($inputName, $usernameTooltip);
                    hasevents.username = true;
                  }
                } else {
                  removeTooltipEvents($inputName);
                  $usernameTooltip.style.display = "none";
                  hasevents.username = false;
                }

                if (errorsServer.email.exist === true) {
                  $alertEmail.style.display = "block";
                  $emailTooltip.innerHTML = errorsServer.email.error;                  
                }

                if (errorsServer.email.valid === false) {
                  if (hasevents.email === false) {
                    setupTooltip($inputEmail, $emailTooltip);
                    hasevents.email = true;
                  }
                } else {
                  removeTooltipEvents($inputEmail);
                  $emailTooltip.style.display = "none";
                  hasevents.email = false;
                }

                
              
              }
              if (errorsServer.username.exist === true) {
                $alertUsername.style.display = "block";
                $usernameTooltip.innerHTML = errorsServer.username.error;
                
              }
              if (errorsServer.username.valid === false) {
                if (hasevents.username === false) {
                  setupTooltip($inputName, $usernameTooltip);
                  hasevents.username = true;
                }
              } else {
                removeTooltipEvents($inputName);
                $usernameTooltip.style.display = "none";
                hasevents.username = false;
              }

              if (errorsServer.email.valid === false) {
                if (hasevents.email === false) {
                  setupTooltip($inputEmail, $emailTooltip);
                  hasevents.email = true;
                }
              } else {
                removeTooltipEvents($inputEmail);
                $emailTooltip.style.display = "none";
                hasevents.email = false;
              }

              if (errorsServer.password.valid.password1 === true) {
                if (errors.password.valid.password2 === false) {
                  if (hasevents.password2 === false) {
                    setupTooltip($inputPassword2, $passwordConfirmTooltip);
                    hasevents.password2 = true;
                  }
                } else {
                  removeTooltipEvents($inputPassword2);
                  $passwordConfirmTooltip.style.display = "none";
                  hasevents.password2 = false;
                }
              }

              if (errorsServer.password.valid.password1 === false) {
                if (hasevents.password1 === false) {
                  setupTooltip($inputPassword1, $passwordTooltip);
                  removeTooltipEvents($inputPassword2);
                  hasevents.password1 = true;
                }
              } else {
                removeTooltipEvents($inputPassword1);
                $passwordTooltip.style.display = "none";
                hasevents.password1 = false;
              }

              $usernameTooltip.innerHTML = "";
              $emailTooltip.innerHTML = "";
              $passwordTooltip.innerHTML = "";
              $passwordConfirmTooltip.innerHTML = "";

              if (errorsServer.username.valid === false) {
                $usernameTooltip.innerHTML =
                  errorsServer.username.error.join("<br>");
                $alertUsername.style.display = "block";
              } else {
                $alertUsername.style.display = "none";
              }
              if (errorsServer.email.valid === false) {
                $emailTooltip.innerHTML = errorsServer.email.error.join("<br>");
                $alertEmail.style.display = "block";
              } else {
                $alertEmail.style.display = "none";
              }
              if (errorsServer.password.valid.password1 === false) {
                $passwordTooltip.innerHTML =
                  errorsServer.password.error[0].password1.join("<br>");
                $alertPassword1.style.display = "block";
              } else {
                $alertPassword1.style.display = "none";
              }
              if (
                errorsServer.password.valid.password2 === false &&
                errorsServer.password.valid.password1 === true
              ) {
                $passwordConfirmTooltip.innerHTML =
                  errorsServer.password.error[0].password2.join("<br>");
                $alertPassword2.style.display = "block";
              } else {
                $alertPassword2.style.display = "none";
              }
            });
        } catch (error) {
          console.log(error);
        }
      } else {
        $inputs.forEach((element) => {
          element.blur();
        });

        if (errors.username.valid === false) {
          if (hasevents.username === false) {
            setupTooltip($inputName, $usernameTooltip);
            hasevents.username = true;
          }
        } else {
          removeTooltipEvents($inputName);
          $usernameTooltip.style.display = "none";
          hasevents.username = false;
        }

        if (errors.email.valid === false) {
          if (hasevents.email === false) {
            setupTooltip($inputEmail, $emailTooltip);
            hasevents.email = true;
          }
        } else {
          removeTooltipEvents($inputEmail);
          $emailTooltip.style.display = "none";
          hasevents.email = false;
        }

        if (errors.password.valid.password1 === true) {
          if (errors.password.valid.password2 === false) {
            if (hasevents.password2 === false) {
              setupTooltip($inputPassword2, $passwordConfirmTooltip);
              hasevents.password2 = true;
            }
          } else {
            removeTooltipEvents($inputPassword2);
            $passwordConfirmTooltip.style.display = "none";
            hasevents.password2 = false;
          }
        }

        if (errors.password.valid.password1 === false) {
          if (hasevents.password1 === false) {
            setupTooltip($inputPassword1, $passwordTooltip);
            removeTooltipEvents($inputPassword2);
            hasevents.password1 = true;
          }
        } else {
          removeTooltipEvents($inputPassword1);
          $passwordTooltip.style.display = "none";
          hasevents.password1 = false;
        }

        $usernameTooltip.innerHTML = "";
        $emailTooltip.innerHTML = "";
        $passwordTooltip.innerHTML = "";
        $passwordConfirmTooltip.innerHTML = "";

        if (errors.username.valid === false) {
          $usernameTooltip.innerHTML = errors.username.error.join("<br>");
          $alertUsername.style.display = "block";
        } else {
          $alertUsername.style.display = "none";
        }
        if (errors.email.valid === false) {
          $emailTooltip.innerHTML = errors.email.error.join("<br>");
          $alertEmail.style.display = "block";
        } else {
          $alertEmail.style.display = "none";
        }
        if (errors.password.valid.password1 === false) {
          $passwordTooltip.innerHTML =
            errors.password.error.password1.join("<br>");
          $alertPassword1.style.display = "block";
        } else {
          $alertPassword1.style.display = "none";
        }
        if (
          errors.password.valid.password2 === false &&
          errors.password.valid.password1 === true
        ) {
          $passwordConfirmTooltip.innerHTML =
            errors.password.error.password2.join("<br>");
          $alertPassword2.style.display = "block";
        } else {
          $alertPassword2.style.display = "none";
        }
      }
    });
});
