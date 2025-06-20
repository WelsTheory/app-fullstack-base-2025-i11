declare const M;
class Main implements EventListenerObject 
{
    /**
     * Inicializa la página de la aplicación:
     * - Realiza la solicitud GET para cargar todos los módulos desde el servidor.
     * - Renderiza dinámicamente las tarjetas de módulos con sus controles.
     * - Asigna eventos a botones de editar, eliminar y switches de encendido/apagado.
     * - Configura tooltips y listeners para los botones globales "Encender todo" y "Apagar todo".
    */
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
                        const icono = data.type === 0 ? "version1" : "version2";
                        htmlContent += `
                        <div class="col l4 m6 s12">
                            <div class="card">
                                <div class="card-content">
                                    <img src="./static/images/${icono}.png" alt="" class="circle" width="15%">
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
                            delMod.addEventListener("click", (ev) => this.deleteModule(ev));
                        }
                    }
                    for (let data of dataMod) 
                    {
                        let editMod = document.getElementById("btn-edit-" + data.id);
                        editMod.addEventListener("click",this);
                    }       
                    for (let data of dataMod) 
                    {
                        let checkMod = document.getElementById("data-"+ data.id +"-state");
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
        let todoModOn: HTMLElement | null = document.getElementById("btn-todo-on");
        let todoModOff: HTMLElement | null = document.getElementById("btn-todo-off");
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

    /**
     * Inicializa todos los tooltips en los elementos con la clase `.tooltipped`.
     * Utiliza el componente Tooltip de Materialize para mostrar información contextual.
    */
    public addTooltips()
    {
        var elems = document.querySelectorAll('.tooltipped');
        var instances = M.Tooltip.init(elems, Option);
    }
    /**
     * Controla todos los eventos de clic delegados en los elementos de la interfaz.
     * Identifica la acción a ejecutar según el ID del elemento clickeado
     * y llama a la función correspondiente (eliminar, cambiar estado, agregar, editar o cambiar estado de todos).
    */
    public handleEvent(ev: Event): void 
    {
        const objetoClick = ev.target as HTMLElement;
        const id = objetoClick.id;
        if (id.startsWith("delete-")) 
        {
            this.deleteModule(ev);
        }
        else if(objetoClick.id.match(/data-\d+-state/))
        {         
            this.changeStateModule(ev);
        }
        else if (id.startsWith("btn-agregar-mod")) 
        {
            this.newAddModule(ev);
        }
        else if( id.startsWith("edit"))
        {
            this.editModule(ev);
        }
        else if(id.startsWith("btn-todo-"))
        {
            this.allStateModule(ev);
        }
        else 
        {
            console.warn("Evento inesperado:", ev);
            alert("Algo salió mal");
            window.location.replace("http://localhost:8000/");
        }
    }

    /**
     * Cambia el estado de todos los módulos (encender o apagar todos).
     * y envía la solicitud correspondiente al servidor.
    */
    public allStateModule(ev: Event) 
    {
        const idModule = (ev.target as HTMLElement).id;
        const actual_state = idModule.split('-')[2];
        if (actual_state !== "on" && actual_state !== "off") 
        {
            console.error("Estado no válido:", actual_state);
            return;
        }
        const next_state = { state: actual_state === "on" };
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8000/devices/all", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () 
        {
            if (xhr.status === 200) 
            {
                console.log("Estado de todos los dispositivos actualizado:", xhr.responseText);
                window.location.reload();
            } 
            else 
            {
                console.error("Error al cambiar estado de todos los dispositivos:", xhr.responseText);
                alert("Error al actualizar todos los dispositivos.");
            }
        };
        xhr.send(JSON.stringify(next_state));
    }

    /**
     * Muestra el formulario modal para agregar un nuevo módulo.
     * Configura los campos del formulario(nombre, descripción y tipo), 
     * maneja la confirmación y el cierre del modal.
    */
    public newAddModule(ev:Event)
    {
        var modal = document.getElementById("modal-new-mod");
        var nameModule: HTMLInputElement = <HTMLInputElement> document.getElementById("modName");
        var descModule: HTMLInputElement = <HTMLInputElement> document.getElementById("modDescription");
        var typeModule: HTMLInputElement = <HTMLInputElement> document.getElementById("modType");
        var cancel = document.getElementById("cancelar-addMod");
        cancel.addEventListener("click", ()=>
        {
            modal.style.display= "none";
            nameModule.value = "";
            descModule.value = "";
            typeModule.value = "";
        })
        
        var addModuleHandler= (ev:Event)=>
        {
            let modName:string = nameModule.value;
            let modDescription:string = descModule.value;
            let modType:string = typeModule.value;
            let newModule = {"name":modName, "description":modDescription, "state":false, "type":modType}
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:8000/devices/add/", true);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onload = function () 
            {
                if (xhr.status === 200) 
                    {
                    modal.style.display = "none";
                    nameModule.value = "";
                    descModule.value = "";
                    typeModule.value = "";
                    window.location.reload();
                } 
                else 
                {
                    console.error("Error:", xhr.responseText);
                    alert("Error al agregar el dispositivo.");
                }
            };

            xhr.send(JSON.stringify(newModule));
        }
        var addConfirmBtn = document.getElementById("btn-confirm-addMod");
        addConfirmBtn.addEventListener("click",addModuleHandler);    
        modal.style.display = "block";
    }

    /**
     * Muestra el modal de confirmación para eliminar un módulo.
     * Gestiona la cancelación y la confirmación de la eliminación enviando la solicitud al servidor.
    */
    public deleteModule(ev: Event) 
    {
        var idModule = (ev.target as HTMLElement).id.split("-")[1];
        var modal = document.getElementById("modal-eliminar");
        const instance = M.Modal.getInstance(modal);
        var cancel = document.getElementById("cancela-eliminar");
        cancel.onclick = () => 
        {
            modal.style.display = "none";
            instance.close();
        };
        var confirmDelete = (ev: Event) => 
        {
            let deleteDevice = { "id": idModule };
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:8000/devices/delete/", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function() 
            {
                if (xhr.status === 200) 
                {
                    console.log("Dispositivo eliminado:", xhr.responseText);
                    instance.close(); 
                    window.location.reload();
                } 
                else 
                {
                    console.error("Error al eliminar:", xhr.responseText);
                    alert("No se pudo eliminar el dispositivo.");
                }
            };
            xhr.send(JSON.stringify(deleteDevice));
        };
        var delConfirmBtn = document.getElementById("confirma-eliminar");
        delConfirmBtn.onclick = confirmDelete;
        instance.open();
    }

    /**
     * Abre el formulario modal de edición para un módulo existente.
     * Carga los datos actuales (nombre, descripción y tipo), 
     * gestiona la confirmación de cambios y cierra el modal.
    */
    public editModule(ev:Event): void
    {
        const idModule = (ev.target as HTMLElement).id.split("-")[1];
        const modal = document.getElementById("modal-edit-module");
        const instance = M.Modal.getInstance(modal);
        const nameModule = document.getElementById("edit-mod-name") as HTMLInputElement;
        const descModule = document.getElementById("edit-description") as HTMLInputElement;
        const typeModule = document.getElementById("edit-type") as HTMLInputElement;
        const cancelBtn = document.getElementById("cancelar-edit");
        cancelBtn.onclick = () => 
        {
            instance.close();
            nameModule.value = "";
            descModule.value = "";
            typeModule.value = "";
        };
        const confirmBtn = document.getElementById("btn-confirm-edit");
        confirmBtn.onclick = () => 
        {
            const ModName = nameModule.value.trim();
            const ModDesc = descModule.value.trim();
            const ModType = typeModule.value.trim();
            if (!ModName || !ModDesc || !ModType) 
            {
                alert("Por favor complete todos los campos.");
                return;
            }
            const newInfo = 
            {
                id: idModule,
                name: ModName,
                description: ModDesc,
                type: ModType
            };
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:8000/devices/edit/", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = () => 
            {
                if (xhr.status === 200) 
                {
                    console.log("Dispositivo editado:", xhr.responseText);
                    nameModule.value = "";
                    descModule.value = "";
                    typeModule.value = "";
                    instance.close();
                    window.location.reload();
                } 
                else 
                {
                    console.error("Error al editar:", xhr.responseText);
                    alert("No se pudo editar el dispositivo.");
                }
            };
    
            xhr.onerror = () => 
            {
                console.error("Error de red al editar.");
                alert("Error de red al editar el dispositivo.");
            };
            xhr.send(JSON.stringify(newInfo));
        };
        instance.open();
    }
    
    /**
     * Cambia el estado (encendido/apagado) de un módulo individual.
     * Envía la solicitud de actualización al servidor.
    */
    public changeStateModule(ev: Event) 
    {
        const checkBox = ev.target as HTMLInputElement;
        const idModule = checkBox.id.split('-');
        if (idModule.length < 2) 
        {
            console.error("ID de checkbox no válido:", checkBox.id);
            return;
        }
        const ModuleId = idModule[1];
        const newState = checkBox.checked;
        const datos = 
        {
            id: ModuleId,
            state: newState
        };
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8000/devices/changestate", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () 
        {
            if (xhr.status === 200) 
            {
                console.log(`Estado del dispositivo ${ModuleId} actualizado correctamente.`);
            } 
            else 
            {
                console.error("Error al actualizar estado:", xhr.responseText);
                alert("No se pudo actualizar el estado del dispositivo.");
            }
        };
        xhr.send(JSON.stringify(datos));
    }
        
}

/**
 * Inicializa la aplicación cuando la ventana se ha cargado por completo.
 * Crea la instancia principal, configura la página y activa todos los modales de Materialize.
*/
window.addEventListener("load", () => 
{
   let miObjMain: Main = new Main();
   miObjMain.initPageApp();
   const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
});
