declare const M;
class Main implements EventListenerObject {
    public initPageApp(): void {
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                //console.log("Respuesta cruda:", xhr.responseText);
                if (xhr.status == 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        
                        // Verificar estructura esperada
                        if (!response.success || !Array.isArray(response.data)) {
                            throw new Error("Formato de respuesta inválido");
                        }

                        const listaDis = response.data;
                        let listaDisp = document.getElementById("listaDisp");
                        
                        if (!listaDisp) {
                            throw new Error("Elemento listaDisp no encontrado");
                        }

                        let htmlContent = '';
                        for (const disp of listaDis) {
                            const checked = disp.state === 1 ? "checked" : "";
                            const icono = disp.type === 0 ? "lightbulb" : "window";
                            htmlContent += `
                            <div class="col l4 m6 s12">
                                <div class="card">
                                    <div class="card-content">
                                        <img src="./static/images/${icono}.png" alt="" class="circle">
                                        <span class="card-title">${disp.name}</span>
                                        <p>${disp.description}</p>
                                    </div>
                                    <div class="card-action">
                                        <a class="btn-floating btn-small waves-effect waves-blue">
                                            <i class="material-icons">edit</i>
                                        </a>
                                        <a id="btn-del-${disp.id}" class="btn-floating btn-small waves-effect waves-red btn-delete-device tooltipped" data-position="bottom" data-tooltip="Eliminar">
                                            <i id="delete-${disp.id}" class="material-icons">delete</i>
                                        </a>
                                        <div class="switch" style="float:right;">
                                            <label>
                                            Off
                                            <input type="checkbox" ${checked}>
                                            <span class="lever"></span>
                                            On
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                        }
                        
                        listaDisp.innerHTML = htmlContent;
                        for (const disp of listaDis) {
                            const delDisp = document.getElementById("btn-del-" + disp.id);
                            if (delDisp) {
                                delDisp.addEventListener("click", this);
                            } else {
                                console.warn("No se encontró el botón para disp.id =", disp.id);
                            }
                        }
                        listaDisp.innerHTML = htmlContent;
                        var elems = document.querySelectorAll('.tooltipped');
                        var instances = M.Tooltip.init(elems, Option);
                    } catch (error) {
                        console.error("Error:", error);
                    }
                } else {
                    console.error("Error HTTP:", xhr.status);
                }
            }
        };
        
        xhr.open("GET", "http://localhost:8000/devices", true);
        xhr.send();
        let addNewDisp: HTMLElement | null = document.getElementById("btn-agregar-disp");

        if (addNewDisp) {
            addNewDisp.addEventListener("click", this);
        } else {
            console.error("No se encontró el botón con ID btn-agregar-disp");
        }

    }

    public addTooltips(){
        var elems = document.querySelectorAll('.tooltipped');
        var instances = M.Tooltip.init(elems, Option);
    }


    handleEvent(ev: Event): void {
        console.log(ev);
        let objetoClick: HTMLElement = <HTMLElement>ev.target;

        if (objetoClick.id.split("-")[0] == "delete"){
            this.delDevConfirm(ev=ev);
        }
        // Handle para agregar nuevo dispositivo
        else if(objetoClick.id == "btn-agregar-disp"){
            this.newDeviceForm(ev=ev)
        }
        else{
            alert("Algo salió mal")
            console.log(ev.target)
            window.location.replace("http://localhost:8000/");
        }
    }

    public newDeviceForm(ev:Event){
        // Conjunto de operaciones para agregar un nuevo dispositivo

        // Objeto Modal, donde está el formulario para nuevo disp.
        var modal = document.getElementById("modal-new-device");

        // Campos del formulario
        // Campos del formulario usando JavaScript puro
        var nameField: HTMLInputElement = <HTMLInputElement> document.getElementById("dev-name");
        var descField: HTMLInputElement = <HTMLInputElement> document.getElementById("description");
        var typeField: HTMLInputElement = <HTMLInputElement> document.getElementById("devType");

        // Botón de cancelar para cerrar la operación
        var cancel = document.getElementById("cancelar-addDev");
        // Cierra el modal y resetea los campos
        cancel.addEventListener("click", ()=>{modal.style.display= "none";
                                            nameField.value = "";
                                            descField.value = "";
        })
        
        // Post para agregar el dispositivo
        var addDevHandler= (ev:Event)=>{
            let devName:string = nameField.value;
            let devDesc:string = descField.value;
            let devType:string = typeField.value;
            let newDevice = {"name":devName, "description":devDesc, "state":false, "type":devType}
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:8000/devices/add/", true);
            xhr.setRequestHeader("Content-Type", "application/json");

            // ✅ ESTA PARTE ES NUEVA:
            xhr.onload = function () {
                if (xhr.status === 200) {
                    // Si la respuesta es exitosa, cerrar modal, limpiar y recargar
                    modal.style.display = "none";
                    nameField.value = "";
                    descField.value = "";
                    typeField.value = "";
                    window.location.reload();
                } else {
                    console.error("Error:", xhr.responseText);
                    alert("Error al agregar el dispositivo.");
                }
            };

            xhr.send(JSON.stringify(newDevice));
        }
        
        // Boton de confirmar el nuevo dispositivo
        var addConfirmBtn = document.getElementById("btn-confirm-addDev");
        addConfirmBtn.addEventListener("click",addDevHandler);    

        // Abrir modal
        modal.style.display = "block";
    }


    // Método del main para eliminar dispositivos
    public delDevConfirm(ev: Event) {
        // Toma id de dispositivo a eliminar
        var id = (ev.target as HTMLElement).id.split("-")[1];
      
        // Referencia al modal
        var modalElement = document.getElementById("modal-eliminar");
        const instance = M.Modal.getInstance(modalElement);
      
        // Operación que se ejecuta al confirmar en el Modal
        const confirmDelete = (ev: Event) => {
          let deleteDevice = { "id": id };
          let xhr = new XMLHttpRequest();
          xhr.open("POST", "http://localhost:8000/devices/delete/", true);
          xhr.setRequestHeader("Content-Type", "application/json");
           // ✅ Esperar respuesta
        xhr.onload = () => {
            if (xhr.status === 200) {
                console.log("Dispositivo eliminado:", xhr.responseText);
                instance.close();
                window.location.reload(); // Recargar la página para reflejar el cambio
            } else {
                console.error("Error al eliminar:", xhr.responseText);
                alert("No se pudo eliminar el dispositivo.");
            }
        };

        xhr.send(JSON.stringify(deleteDevice));
        };
      
        // Confirmar operación
        const delConfirmBtn = document.getElementById("confirma-eliminar");
        delConfirmBtn.onclick = confirmDelete;
      
        // Botón de cancelar para cerrar la operación
        const cancel = document.getElementById("cancela-eliminar");
        cancel.onclick = () => instance.close();
      
        // Muestra el modal usando la instancia correcta
        instance.open();
      }
    
        
}

window.addEventListener("load", () => {
   let miObjMain: Main = new Main();
   miObjMain.initPageApp();
   // Inicializar todos los modales
   const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
   
});
