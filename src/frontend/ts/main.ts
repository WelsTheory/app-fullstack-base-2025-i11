declare const M;
class Main implements EventListenerObject {
    public initPageApp(): void {
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                //console.log("Respuesta cruda:", xhr.responseText);
                if (xhr.status == 200) {
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
                                        <span class="card-title">${disp.name}
                                         <a id = "btn-edit-${disp.id}" class="btn-floating btn-small waves-effect waves-blue btn-edit-device tooltipped" data-position="bottom" data-tooltip="Editar">
                                            <i id ="edit-${disp.id}" class="small material-icons">edit</i></a>
                                        <a id="btn-del-${disp.id}" class="btn-floating btn-small waves-effect waves-red btn-delete-device tooltipped" data-position="bottom" data-tooltip="Eliminar">
                                            <i id="delete-${disp.id}" class="material-icons">delete</i>
                                        </a>
                                        </span>
                                        <p>${disp.description}</p>
                                    </div>
                                    <div class="card-action">
                                    <a href="#!" class="secondary-content">
                                        <div class="switch" style="float:right;">
                                            <label>
                                            Off
                                            <input id="disp-${disp.id}-state" type="checkbox" ${checked}>
                                            <span class="lever"></span>
                                            On
                                            </label>
                                        </div>
                                    </a>
                                    </div>
                                </div>
                            </div>`;
                        }
                        
                        listaDisp.innerHTML = htmlContent;
                        for (const disp of listaDis) {
                            const delDisp = document.getElementById("btn-del-" + disp.id);
                            if (delDisp) {
                                delDisp.addEventListener("click", (ev) => this.delDevConfirm(ev));
                            }
                        }
                        //listaDisp.innerHTML = htmlContent;
                        for (let disp of listaDis) {
                            let delDisp = document.getElementById("btn-edit-" + disp.id);
                            delDisp.addEventListener("click",this);
                        }       
                        for (let disp of listaDis) {
                            let checkDisp = document.getElementById("disp-" + disp.id +"-state");
                            checkDisp.addEventListener("click", this);
                        }
                        var elems = document.querySelectorAll('.tooltipped');
                        M.Tooltip.init(elems);
                    
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

        let allDevOnBtn: HTMLElement | null = document.getElementById("btn-alldev-on");
        let allDevOffBtn: HTMLElement | null = document.getElementById("btn-alldev-off");

        if (allDevOnBtn) {
            allDevOnBtn.addEventListener("click", this);
        } else {
            console.error("No se encontró el botón Encender Todo");
        }

        if (allDevOffBtn) {
            allDevOffBtn.addEventListener("click", this);
        } else {
            console.error("No se encontró el botón Apagar Todo");
        }

    }

    public addTooltips(){
        var elems = document.querySelectorAll('.tooltipped');
        var instances = M.Tooltip.init(elems, Option);
    }


    public handleEvent(ev: Event): void {
        console.log(ev);
        const objetoClick = ev.target as HTMLElement;
        const id = objetoClick.id;

        if (id.startsWith("delete-")) {
            this.delDevConfirm(ev);
        }
        else if(objetoClick.id.match(/disp-\d+-state/))
        {         
            this.changeDevState(ev);
        }
        else if (id === "btn-agregar-disp") {
            this.newDeviceForm(ev);
        }
        else if( id.startsWith("edit")){
            this.editDevConfirm(ev);
        }else if(id.startsWith("btn-alldev")){
            this.allDevState(ev);
        }
        else {
            console.warn("Evento inesperado:", ev);
            alert("Algo salió mal");
            window.location.replace("http://localhost:8000/");
        }
    }

    public allDevState(ev: Event) {
        const idPart = (ev.target as HTMLElement).id; // más seguro con TypeScript
        const on_off = idPart.split('-')[2];
    
        // Validar valor esperado
        if (on_off !== "on" && on_off !== "off") {
            console.error("Estado no válido:", on_off);
            return;
        }
    
        // Crear payload
        const state = { state: on_off === "on" };
    
        // Crear solicitud
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8000/devices/all", true);
        xhr.setRequestHeader("Content-Type", "application/json");
    
        // Manejador de respuesta
        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log("Estado de todos los dispositivos actualizado:", xhr.responseText);
                window.location.reload();
            } else {
                console.error("Error al cambiar estado de todos los dispositivos:", xhr.responseText);
                alert("Error al actualizar todos los dispositivos.");
            }
        };
    
        // Enviar JSON
        xhr.send(JSON.stringify(state));
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
        console.log("Modal Element:", modal);
        var id = (ev.target as HTMLElement).id.split("-")[1];
      
        // Referencia al modal
        var modal = document.getElementById("modal-eliminar");
        const instance = M.Modal.getInstance(modal);
        console.log("Modal Element:", modal);
        console.log("Modal Instance:", instance);
        
        var cancel = document.getElementById("cancela-eliminar");
        cancel.onclick = () => {
            modal.style.display = "none";
            instance.close();
        };

      
        // Operación que se ejecuta al confirmar en el Modal
        var confirmDelete = (ev: Event) => {
            let deleteDevice = { "id": id };
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:8000/devices/delete/", true);
            xhr.setRequestHeader("Content-Type", "application/json");
           // ✅ Esperar respuesta
            xhr.onload = function() {
                if (xhr.status === 200) {
                    console.log("Dispositivo eliminado:", xhr.responseText);
                    instance.close(); // <- Usa close del modal, no style.display
                    window.location.reload(); // Recargar la página para reflejar el cambio
                } else {
                    console.error("Error al eliminar:", xhr.responseText);
                    alert("No se pudo eliminar el dispositivo.");
                }
            };

            xhr.send(JSON.stringify(deleteDevice));
        };
      
        // Confirmar operación
        var delConfirmBtn = document.getElementById("confirma-eliminar");
        //delConfirmBtn.addEventListener("click",confirmDelete);
        delConfirmBtn.onclick = confirmDelete;
      
        instance.open();
      }

    public editDevConfirm(ev:Event): void{
        // Obtener ID desde el botón pulsado
        const id = (ev.target as HTMLElement).id.split("-")[1];

        // Referencia al modal de edición
        const modal = document.getElementById("modal-edit-device");
        const instance = M.Modal.getInstance(modal);

        // Campos del formulario
        const nameField = document.getElementById("edit-dev-name") as HTMLInputElement;
        const descField = document.getElementById("edit-description") as HTMLInputElement;

        // Botón de cancelar para cerrar la operación
        // Botón Cancelar
        const cancelBtn = document.getElementById("cancelar-edit");
        cancelBtn.onclick = () => {
            instance.close();
            nameField.value = "";
            descField.value = "";
        };
        
        const confirmBtn = document.getElementById("btn-confirm-edit");

        confirmBtn.onclick = () => {
            const devName = nameField.value.trim();
            const devDesc = descField.value.trim();
    
            if (!devName || !devDesc) {
                alert("Por favor complete todos los campos.");
                return;
            }
    
            const newInfo = {
                id: id,
                name: devName,
                description: devDesc
            };
    
            // Enviar con XMLHttpRequest
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:8000/devices/edit/", true);
            xhr.setRequestHeader("Content-Type", "application/json");
    
            xhr.onload = () => {
                if (xhr.status === 200) {
                    console.log("Dispositivo editado:", xhr.responseText);
                    instance.close();
                    window.location.reload();
                } else {
                    console.error("Error al editar:", xhr.responseText);
                    alert("No se pudo editar el dispositivo.");
                }
            };
    
            xhr.onerror = () => {
                console.error("Error de red al editar.");
                alert("Error de red al editar el dispositivo.");
            };
    
            xhr.send(JSON.stringify(newInfo));
        };
    
        // Abrir modal usando Materialize
        instance.open();
    }
    
    public changeDevState(ev: Event) {
        // Obtener la checkbox que disparó el evento
        const checkBox = ev.target as HTMLInputElement;
    
        // Validar ID y extraer el número de dispositivo
        const idParts = checkBox.id.split('-');
        if (idParts.length < 2) {
            console.error("ID de checkbox no válido:", checkBox.id);
            return;
        }
    
        const deviceId = idParts[1];
        const newState = checkBox.checked;
    
        const datos = {
            id: deviceId,
            state: newState
        };
    
        // Enviar con XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8000/devices/changestate", true);
        xhr.setRequestHeader("Content-Type", "application/json");
    
        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log(`Estado del dispositivo ${deviceId} actualizado correctamente.`);
            } else {
                console.error("Error al actualizar estado:", xhr.responseText);
                alert("No se pudo actualizar el estado del dispositivo.");
            }
        };
    
        xhr.send(JSON.stringify(datos));
    }
        
}

window.addEventListener("load", () => {
   let miObjMain: Main = new Main();
   miObjMain.initPageApp();
   // Inicializar todos los modales
   const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
   
});
