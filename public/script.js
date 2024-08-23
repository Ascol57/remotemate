var gridConfig = {}

if (localStorage.getItem("RemoteMateConfig")) {
    gridConfig = JSON.parse(localStorage.getItem("RemoteMateConfig"))
} else {
    var gridConfig = {
        height: 4,
        width: 5,
        locked: false,
        data: [],
        castmateConfig: {
            hostname: "localhost",
            port: "8181",
        }
    }

    localStorage.setItem("RemoteMateConfig", JSON.stringify(gridConfig))
}

function save() {
    localStorage.setItem("RemoteMateConfig", JSON.stringify(gridConfig))
}

grid = []

function render() {
    const gridContainer = document.querySelector('#grid-container')

    for (let height = 0; height < gridConfig.height; height++) {
        grid[height] = []
        if (!gridConfig.data[height]) {
            gridConfig.data[height] = []
        }
        grid[height] = []
        for (let width = 0; width < gridConfig.width; width++) {
            element = document.createElement('div')
            element.classList.add('Rbutton')
            gridContainer.style.cssText = `--width: ${gridConfig.width}`;
            if (gridConfig.data[height][width]) {
                element.innerText = gridConfig.data[height][width]
            } else {
                gridConfig.data[height][width] = ""
            }
            element.addEventListener('click', async (event) => {
                if (!gridConfig.locked) {
                    requestButton(gridConfig.data[height][width])
                } else {
                    if (event.originalTarget.className == "Rbutton") {
                        event.originalTarget.innerText = ""
                        var values = await getbuttons();

                        var select = document.createElement("select");
                        select.name = "pets";
                        select.id = "pets"

                        for (const val of values) {
                            var option = document.createElement("option");
                            option.value = val;
                            option.text = val.charAt(0).toUpperCase() + val.slice(1);
                            select.appendChild(option);
                        }

                        event.originalTarget.appendChild(select);
                    } else if (event.originalTarget.tagName == "OPTION") {
                        console.log(event.originalTarget.parentElement.parentElement)
                        gridConfig.data[height][width] = event.originalTarget.value
                        event.originalTarget.parentElement.parentElement.innerText = event.originalTarget.value
                    }
                }
            })
            gridContainer.appendChild(element)
        }
    }
}

render()
save()

const lockedButton = document.querySelector('.settingsLock')

lockedButton.addEventListener('click', () => {
    lockedButton.classList.toggle('locked')
    if (gridConfig.locked) {
        gridConfig.locked = false
        save()
    } else {
        gridConfig.locked = true
    }
})

function openConnection() {
    const reponse = fetch(`/config/${gridConfig.castmateConfig.hostname}/${gridConfig.castmateConfig.port}`, {
        method: "GET",
        mode: "no-cors",
    });
    
    const ws = new WebSocket(`ws://${gridConfig.castmateConfig.hostname}:${gridConfig.castmateConfig.port}?overlay=vlGRI9mzYdxpIBZXGPIDa`);

    ws.onmessage = function (msg) {
        console.log(msg)
        if (JSON.parse(msg.data).name == "overlays_widgetRPC" && JSON.parse(msg.data).args[1] == "showAlert") {
            title = JSON.parse(msg.data).args[2]
            detail = JSON.parse(msg.data).args[3]
            console.log(title, detail)
            document.querySelector('.screen').innerHTML += `<div>${title} : ${detail}</div>`;
            document.querySelector('.screen').scrollTop = document.querySelector('.screen').scrollHeight;
        }
    };

    ws.addEventListener("open", (event) => {
        document.querySelector(".screen .status").classList.add('connected')
        document.querySelector(".screen .status").classList.remove('disconnected')
    });

    ws.addEventListener("error", (event) => {
        document.querySelector(".screen .status").classList.add('disconnected')
        document.querySelector(".screen .status").classList.remove('connected')
    });

    return ws
}

var wsServer = openConnection()

function reloadConnection() {
    const reponse = fetch(`/config/${gridConfig.castmateConfig.hostname}/${gridConfig.castmateConfig.port}`, {
        method: "GET",
        mode: "no-cors",
    });

    wsServer.close()
    wsServer = new WebSocket(`ws://${gridConfig.castmateConfig.hostname}:${gridConfig.castmateConfig.port}?overlay=vlGRI9mzYdxpIBZXGPIDa`);

    wsServer.onmessage = function (msg) {
        console.log(msg)
        if (JSON.parse(msg.data).name == "overlays_widgetRPC" && JSON.parse(msg.data).args[1] == "showAlert") {
            title = JSON.parse(msg.data).args[2]
            detail = JSON.parse(msg.data).args[3]
            console.log(title, detail)
            document.querySelector('.screen').innerHTML += `<div>${title} : ${detail}</div>`;
            document.querySelector('.screen').scrollTop = document.querySelector('.screen').scrollHeight;
        }
    };

    wsServer.addEventListener("open", (event) => {
        document.querySelector(".screen .status").classList.add('connected')
        document.querySelector(".screen .status").classList.remove('disconnected')
    });

    wsServer.addEventListener("error", (event) => {
        document.querySelector(".screen .status").classList.add('disconnected')
        document.querySelector(".screen .status").classList.remove('connected')
    });
}

const wsInput = document.querySelectorAll('.settings .flex input')

wsInput.forEach((input) => {
    input.addEventListener('input', (event) => {
        gridConfig.castmateConfig[event.target.id] = event.target.value
        save()
        reloadConnection(wsServer)
    })
})

async function getbuttons() {
    const reponse = await fetch("/proxy/plugins/remote/buttons", {
        method: "GET",
        mode: "no-cors",
    });
    const buttons = await reponse.text();
    return JSON.parse(buttons).buttons
}

async function requestButton(name) {
    const reponse = await fetch("/proxy/plugins/remote/buttons/press?button=" + name, {
        method: "POST",
        mode: "no-cors",
    });
}