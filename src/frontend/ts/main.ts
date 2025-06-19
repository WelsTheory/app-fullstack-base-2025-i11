declare const M;
class Main implements EventListenerObject 
{
    public initPageApp(): void 
    {
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.onreadystatechange = () => 
        {
            if (xhr.readyState == 4) 
            {
                if (xhr.status == 200) 
                {
                    const response = JSON.parse(xhr.responseText);
                    if (!response.success || !Array.isArray(response.data)) 
                    {
                        throw new Error("Formato de respuesta inválido");
                    }
                    const dataMod = response.data;
                    let listMod = document.getElementById("listMod");
                    if (!listMod) 
                    {
                        throw new Error("Elemento listMod no encontrado");
                    }
                    let htmlContent = '';
                    for (const data of dataMod) 
                    {
                        const checked = data.state === 1 ? "checked" : "";
                        const icono = data.type === 0 ? "lightbulb" : "window";
                        htmlContent += `
                        <div class="col l4 m6 s12">
                            <div class="card">
                                <div class="card-content">
                                    <img src="./static/images/${icono}.png" alt="" class="circle">
                                    <span class="card-title">${data.name}
                                        <a id = "btn-edit-${data.id}" class="btn-floating btn-small waves-effect btn-edit-device tooltipped btn-blue-hover" data-position="bottom" data-tooltip="Editar">
                                        <i id ="edit-${data.id}" class="small material-icons">edit</i></a>
                                    <a id="btn-del-${data.id}" class="btn-floating btn-small waves-effect btn-edit-device tooltipped btn-red-hover" data-position="bottom" data-tooltip="Eliminar">
                                        <i id="delete-${data.id}" class="material-icons">delete</i>
                                    </a>
                                    </span>
                                    <p>${data.description}</p>
                                </div>
                                <div class="card-action">
                                <a href="#!" class="secondary-content">
                                    <div class="switch" style="float:right;">
                                        <label>
                                        Off
                                        <input id="data-${data.id}-state" type="checkbox" ${checked}>
                                        <span class="lever"></span>
                                        On
                                        </label>
                                    </div>
                                </a>
                                </div>
                            </div>
                        </div>`;
                    }
                    listMod.innerHTML = htmlContent;
                    for (const data of dataMod) 
                    {
                        const delMod = document.getElementById("btn-del-" + data.id);
                        if (delMod)
                        {
                            delMod.addEventListener("click", (ev) => this.deleteMod(ev));
                        }
                    }
                    for (let data of dataMod) 
                    {
                        let editMod = document.getElementById("btn-edit-" + data.id);
                        editMod.addEventListener("click",this);
                    }       
                    for (let data of dataMod) 
                    {
                        let checkMod = document.getElementById("data-" + data.id +"-state");
                        checkMod.addEventListener("click", this);
                    }
                    var elems = document.querySelectorAll('.tooltipped');
                    M.Tooltip.init(elems);
                    
                } 
                else 
                {
                    console.error("Error HTTP:", xhr.status);
                }
            }
        };
        
        xhr.open("GET", "http://localhost:8000/devices", true);
        xhr.send();
        let addNewMod: HTMLElement | null = document.getElementById("btn-agregar-mod");

        if (addNewMod) 
        {
            addNewMod.addEventListener("click", this);
        } 
        else 
        {
            console.error("No se encontró el botón con ID btn-agregar-mod");
        }

        let todoModOn: HTMLElement | null = document.getElementById("btn-todo-mod-on");
        let todoModOff: HTMLElement | null = document.getElementById("btn-todo-mod-off");

        if (todoModOn) 
        {
            todoModOn.addEventListener("click", this);
        } 
        else 
        {
            console.error("No se encontró el botón Encender Todo");
        }

        if (todoModOff) 
        {
            todoModOff.addEventListener("click", this);
        } 
        else 
        {
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
            this.deleteMod(ev);
        }
        else if(objetoClick.id.match(/data-\d+-state/))
        {         
            this.changeDevState(ev);
        }
        else if (id.startsWith("btn-agregar-mod")) {
            this.newAddModule(ev);
        }
        else if( id.startsWith("edit")){
            this.editDevConfirm(ev);
        }else if(id.startsWith("btn-todo")){
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

    public newAddModule(ev:Event)
    {
        var modal = document.getElementById("modal-new-mod");

        var nameField: HTMLInputElement = <HTMLInputElement> document.getElementById("modName");
        var descField: HTMLInputElement = <HTMLInputElement> document.getElementById("modDescription");
        var typeField: HTMLInputElement = <HTMLInputElement> document.getElementById("modType");

        var cancel = document.getElementById("cancelar-addMod");
        cancel.addEventListener("click", ()=>{modal.style.display= "none";
                                            nameField.value = "";
                                            descField.value = "";
        })
        
        var addDevHandler= (ev:Event)=>{
            let modName:string = nameField.value;
            let modDescription:string = descField.value;
            let modType:string = typeField.value;
            let newModulo = {"name":modName, "description":modDescription, "state":false, "type":modType}
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:8000/devices/add/", true);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onload = function () {
                if (xhr.status === 200) {
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

            xhr.send(JSON.stringify(newModulo));
        }
        var addConfirmBtn = document.getElementById("btn-confirm-addMod");
        addConfirmBtn.addEventListener("click",addDevHandler);    
        modal.style.display = "block";
    }


    // Método del main para eliminar dispositivos
    public deleteMod(ev: Event) {
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
