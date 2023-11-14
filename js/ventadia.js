const ventasDiv = document.getElementById("ventas");
const nuevoDiaBtn = document.getElementById("nuevo-dia");

function cargarVentas() {
    const ventasPorDia = localStorage.getItem("ventas-por-dia");
    const ventas = ventasPorDia ? JSON.parse(ventasPorDia) : 0;
    ventasDiv.innerHTML = `$${ventas}`;
}

nuevoDiaBtn.addEventListener("click", function () {
    Swal.fire({
        title: 'Ingresa la contraseña',
        input: 'password',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        showLoaderOnConfirm: true,
    }).then((result) => {
        if (result.isConfirmed) {
            if (result.value == 'ADMIN') { 
                const ventasPorDia = localStorage.getItem("ventas-por-dia");
                const ventas = ventasPorDia ? JSON.parse(ventasPorDia) : 0;

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                doc.setFontSize(50)
                doc.text(`Total ventas: $${ventas}`, 45, 130);

                // Añade la fecha y hora actuales al documento
                const fecha = new Date();
                doc.setFontSize(20);
                doc.text(`Fecha: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`, 60, 170);

                doc.save('ventas-del-dia.pdf');

                localStorage.removeItem("ventas-por-dia");
                cargarVentas();
            } else {
                Swal.fire('No es posible hacer la petición')
            }
        }
    })
});

cargarVentas();
