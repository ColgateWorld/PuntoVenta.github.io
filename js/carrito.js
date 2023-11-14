let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito);

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");

function cargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carrito-producto");

            // Asigna el ID del producto al div
            div.id = producto.id;

            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <input type="number" value="${producto.cantidad}" min="1" onchange="actualizarCantidad('${producto.id}', this.value)">
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${producto.precio}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${producto.precio * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;

            contenedorCarritoProductos.append(div);

            // Crear un teclado virtual para el contenedor de cantidad
            crearTecladoVirtual(div.querySelector(".carrito-producto-cantidad"));
        });

        actualizarBotonesEliminar();
        actualizarTotal();
    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
}

function actualizarCantidad(idProducto, nuevaCantidad) {
    // Find the product in the cart
    const producto = productosEnCarrito.find(producto => producto.id === idProducto);

    // Check if product was found
    if (!producto) {
        console.error(`No se encontró ningún producto con el id ${idProducto}`);
        return;
    }

    // Update the quantity of the product
    producto.cantidad = nuevaCantidad;

    // Update local storage
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

    // Reload products in cart
    cargarProductosCarrito();
}

cargarProductosCarrito();

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}


function eliminarDelCarrito(e) {

    Toastify({
        text: "producto eliminado",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #4b33a8, #96c93d)",
          borderRadius: "2rem",
          textTransform: "uppercase",
          fontSize: ".75rem"
        },
        offset: {
            x: "1.5rem", // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: "1.5rem" // vertical axis - can be a number or a string indicating unity. eg: '2em'
          },
        onClick: function(){} // Callback after click
      }).showToast();


    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
    
    productosEnCarrito.splice(index, 1);
    cargarProductosCarrito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

botonVaciar.addEventListener("click", vaciarCarrito);
function vaciarCarrito() {

    Swal.fire({
        title: '¿Estás seguro/a?',
        icon: 'question',
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:'Sí',
        cancelButtonText:'No',
      }).then((result) => {
        if (result.isConfirmed) {
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        }
      })
    
}

function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    total.innerText = `$${totalCalculado}`; 
}

botonComprar.addEventListener("click", comprarCarrito);
function comprarCarrito() {
    // Calcula el número de productos diferentes en el carrito
    const totalProductosDiferentes = productosEnCarrito.length;
    
    Swal.fire({
        title: '¿Estás seguro/a de tu compra?',
        html:`Se comprarán ${totalProductosDiferentes} productos diferentes del carrito.`,
        showDenyButton: true,
        confirmButtonText: 'Sí',
        denyButtonText: `No`,
    }).then((result) => {
        if (result.isConfirmed) {
            // Calcula la altura necesaria para el ticket
            const alturaMinima = 80; // Establece una altura mínima para el ticket
            let alturaTicket = 20 + (totalProductosDiferentes * 13); // Ajusta este cálculo según tus necesidades
            alturaTicket = Math.max(alturaTicket, alturaMinima); // Usa la altura mínima si la altura calculada es menor

            // Crea una nueva instancia de jsPDF con dimensiones específicas para un ticket
            const doc = new jsPDF({ unit: 'mm', format: [72, alturaTicket] }); // Ajusta las dimensiones según tus necesidades

            // Establece la fuente y el tamaño para el documento
            doc.setFontSize(8); // Ajusta el tamaño de la fuente según tus necesidades

            // Calcula el costo total
            const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad),0);

            // Añade un título al documento
            doc.text("Ticket de compra", 10, 10); 
            doc.setFontType("bold");
            doc.text(`Total: $${totalCalculado}`, 50, 10); 
            doc.setFontType("normal");

            // Añade una línea horizontal debajo del título
            doc.setLineWidth(0.5);
            doc.line(10, 15, 62, 15); // Ajusta la posición de la línea según tus necesidades

            // Añade los detalles de cada producto al documento
            let y = 20;
            let x = 10;
            productosEnCarrito.forEach(producto => {
                doc.setFontType("bold");
                doc.text(`${producto.titulo}`, x, y); 
                y += 3; // Añade más espacio después del título del producto
                doc.setFontType("normal");
                doc.text(`Cantidad: ${producto.cantidad}`, x, y + 1); 
                doc.text(`Subtotal: $${producto.precio * producto.cantidad}`, x + 30, y + 1); 

                y += 8; // Añade más espacio entre los productos
            });

            // Añade un mensaje de agradecimiento en la parte restante del ticket
            doc.setFontType("bold");
            doc.setFontSize(9); // Ajusta el tamaño de la fuente según tus necesidades
            doc.text("¡Gracias por su compra, regrese pronto!", 6, y + 8); 

            doc.save('Ticket');

            // Abre el PDF en una nueva pestaña del navegador
            window.open(doc.output('bloburl'));


            // Convierte el PDF a una cadena de datos Base64
           // const pdfData = doc.output('datauristring');

            // Abre el PDF en una nueva ventana del navegador
            // window.open(pdfData);

            // Guardar las ventas del día en el localStorage
            const ventasPorDia = localStorage.getItem("ventas-por-dia");
            let ventas = ventasPorDia ? parseFloat(ventasPorDia) : 0;
            const totalCalculado1 = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
            ventas += totalCalculado1;
            localStorage.setItem("ventas-por-dia", JSON.stringify(ventas));

            Swal.fire('¡Compra realizada!', '', 'success')
            productosEnCarrito.length =0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

            contenedorCarritoVacio.classList.add("disabled");
            contenedorCarritoProductos.classList.add("disabled");
            contenedorCarritoAcciones.classList.add("disabled");
            contenedorCarritoComprado.classList.remove("disabled");
        } else if (result.isDenied){
          Swal.fire('¡Compra no realizada!', '', 'error')
        }
    })
}





function crearTecladoVirtual(contenedor) {
    const input = contenedor.querySelector("input");

    const tecladoVirtual = document.createElement("div");
    tecladoVirtual.classList.add("teclado-virtual");

    for (let i = 1; i <= 9; i++) {
        const boton = document.createElement("button");
        boton.textContent = i;
        boton.addEventListener("click", (event) => {
            input.value += i.toString();
            event.stopPropagation(); // Detiene la propagación del evento
        });
        tecladoVirtual.append(boton);
    }

    const botonEnter = document.createElement("button");
    botonEnter.textContent = "Enter";
    botonEnter.classList.add("enter");
    botonEnter.addEventListener("click", (event) => {
        // Actualiza la cantidad y el subtotal
        actualizarCantidad(input.parentNode.parentNode.id, input.value);
        
        tecladoVirtual.style.display = "none";
        event.stopPropagation(); // Detiene la propagación del evento
    });
    tecladoVirtual.append(botonEnter);

    const botonBorrar = document.createElement("button");
    botonBorrar.textContent = "Borrar";
    botonBorrar.addEventListener("click", (event) => {
        input.value = input.value.slice(0, -1);
        event.stopPropagation(); // Detiene la propagación del evento
    });
    tecladoVirtual.append(botonBorrar);

    const boton0 = document.createElement("button");
    boton0.textContent = 0;
    boton0.addEventListener("click", (event) => {
        input.value += '0';
        event.stopPropagation(); // Detiene la propagación del evento
    });
    tecladoVirtual.append(boton0);

    contenedor.append(tecladoVirtual);

    // Mostrar el teclado virtual cuando se hace clic en el contenedor
    contenedor.addEventListener("click", (event) => {
        // Oculta todos los otros teclados virtuales
        document.querySelectorAll(".teclado-virtual").forEach(teclado => {
            if (teclado !== tecladoVirtual) {
                teclado.style.display = "none";
            }
        });

        tecladoVirtual.style.display = "block";
        event.stopPropagation();
    });
}

// Crear un teclado virtual para cada contenedor "carrito-producto-cantidad"
document.querySelectorAll(".carrito-producto-cantidad").forEach(crearTecladoVirtual);

// Ocultar todos los teclados virtuales cuando se hace clic fuera de ellos
document.addEventListener("click", () => {
    document.querySelectorAll(".teclado-virtual").forEach(teclado => {
        teclado.style.display = "none";
    });
});

