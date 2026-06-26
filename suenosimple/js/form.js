const form = document.querySelector('.contacto-form')
const nombreInput = form.querySelector('input[type="text"]')
const emailInput = form.querySelector('input[type="email"]')
const telefonoInput = form.querySelector('input[type="number"]')
const mensajeInput = form.querySelector('textarea')

// Creamos un <span> de error debajo de cada campo, ya que el HTML no los trae
function crearSpanError(input) {
  const span = document.createElement('span')
  span.className = 'error'
  input.insertAdjacentElement('afterend', span)
  return span
}

const errorNombre = crearSpanError(nombreInput)
const errorEmail = crearSpanError(emailInput)
const errorTelefono = crearSpanError(telefonoInput)
const errorMensaje = crearSpanError(mensajeInput)

// Mensaje de éxito, creado al final del form
const successMsg = document.createElement('p')
successMsg.className = 'success'
form.appendChild(successMsg)

function validarNombre() {
  const valor = nombreInput.value.trim()
  if (valor === '') {
    mostrarError(nombreInput, errorNombre, 'El nombre es obligatorio')
    return false
  }
  if (valor.length < 2) {
    mostrarError(nombreInput, errorNombre, 'El nombre debe tener al menos 2 caracteres')
    return false
  }
  limpiarError(nombreInput, errorNombre)
  return true
}

function validarEmail() {
  const valor = emailInput.value.trim()
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (valor === '') {
    mostrarError(emailInput, errorEmail, 'El email es obligatorio')
    return false
  }
  if (!regexEmail.test(valor)) {
    mostrarError(emailInput, errorEmail, 'Ingresá un email válido')
    return false
  }
  limpiarError(emailInput, errorEmail)
  return true
}

function validarMensaje() {
  const valor = mensajeInput.value.trim()
  if (valor === '') {
    mostrarError(mensajeInput, errorMensaje, 'El mensaje es obligatorio')
    return false
  }
  if (valor.length < 10) {
    mostrarError(mensajeInput, errorMensaje, 'El mensaje debe tener al menos 10 caracteres')
    return false
  }
  limpiarError(mensajeInput, errorMensaje)
  return true
}

function validarTelefono() {
  const valor = telefonoInput.value.trim()

  if (valor === '') {
    limpiarError(telefonoInput, errorTelefono)
    return true
  }

  const soloNumeros = /^\d+$/
  if (!soloNumeros.test(valor)) {
    mostrarError(telefonoInput, errorTelefono, 'Solo se permiten números')
    return false
  }

  if (valor.length < 8 || valor.length > 11) {
    mostrarError(telefonoInput, errorTelefono, 'Ingresá un número válido (8 a 11 dígitos)')
    return false
  }

  limpiarError(telefonoInput, errorTelefono)
  return true
}

function mostrarError(input, spanError, texto) {
  input.classList.add('invalid')
  spanError.textContent = texto
}

function limpiarError(input, spanError) {
  input.classList.remove('invalid')
  spanError.textContent = ''
}

// Validación en tiempo real al salir de cada campo
nombreInput.addEventListener('blur', validarNombre)
emailInput.addEventListener('blur', validarEmail)
telefonoInput.addEventListener('blur', validarTelefono)
mensajeInput.addEventListener('blur', validarMensaje)

// Validación al enviar
form.addEventListener('submit', function (e) {
  e.preventDefault()
  successMsg.textContent = ''

  const nombreOk = validarNombre()
  const emailOk = validarEmail()
  const telefonoOk = validarTelefono()
  const mensajeOk = validarMensaje()

  if (nombreOk && emailOk && telefonoOk && mensajeOk) {
    enviarFormulario()
  }
})

function enviarFormulario() {
  const datos = {
    name: nombreInput.value.trim(),
    email: emailInput.value.trim(),
    phone: telefonoInput.value.trim() || null,
    message: mensajeInput.value.trim()
  }

  console.log('Enviando formulario con estos datos:', datos)

  fetch('https://genius-crm-virid.vercel.app/api/landings/3/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
    .then(function (response) {
      console.log('Respuesta del servidor - status:', response.status)
      return response.json().then(function (data) {
        if (!response.ok) {
          throw new Error(data.error || 'Error al enviar el formulario')
        }
        return data
      })
    })
    .then(function (data) {
      console.log('Lead creado correctamente:', data)
      form.reset()

      const popup = document.getElementById('popupExito')
      popup.classList.add('visible')
      setTimeout(() => popup.classList.remove('visible'), 3500)
    })
    .catch(function (error) {
      console.error('Error al enviar el formulario:', error.message)

      const popup = document.getElementById('popupExito')
      popup.textContent = '❌ Error al enviar el mensaje'
      popup.classList.add('visible', 'error')
      setTimeout(() => {
        popup.classList.remove('visible', 'error')
        popup.textContent = '✅ Mensaje enviado correctamente'
      }, 3500)
    })
}