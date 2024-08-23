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
            alertId: ""
        }
    }

    generateGrid()

    localStorage.setItem("RemoteMateConfig", JSON.stringify(gridConfig))
}

function save() {
    localStorage.setItem("RemoteMateConfig", JSON.stringify(gridConfig))
}

function generateGrid() {
    for (let height = 0; height < gridConfig.height; height++) {
        gridConfig.data[height] = []
        for (let width = 0; width < gridConfig.width; width++) {
            gridConfig.data[height][width] = {}
        }
    }
}

function addComponent(top, left, type, data) {
    gridConfig.data[top][left] = {
        type: type,
        data: data
    }
    render()
    save()
}

function removeComponent(top, left) {
    gridConfig.data[top][left] = {}
    save()
    render()
}

function render() {
    const container = document.querySelector('.grid-container')

    var usedGrid = []

    for (let height = 0; height < gridConfig.height; height++) {
        usedGrid[height] = []
        for (let width = 0; width < gridConfig.width; width++) {
            usedGrid[height][width] = false
        }
    }


    for (let height = 0; height < gridConfig.height; height++) {
        for (let width = 0; width < gridConfig.width; width++) {
            if (!usedGrid[height][width]) {
                res = detectAComponent(height, width)

                component = gridConfig.data[height][width]

                element = document.createElement('div')
                element.style.cssText = `grid-column: ${width + 1} / ${res.left + 2};  grid-row: ${height + 1} / ${res.top + 2};`;

                if (component.type == "button") {
                    generateButton(element, component)
                    container.appendChild(element)
                } else if (component.type == "screen") {
                    generateScreen(element, component)
                    container.appendChild(element)
                    openConnection()
                }

                for (let H = height; H <= res.top; H++) {
                    for (let W = width; W <= res.left; W++) {
                        usedGrid[H][W] = true
                    }
                }
            }
        }
    }

    console.log(usedGrid)

    container.style.cssText = `--width: ${gridConfig.width}; --height: ${gridConfig.width}`;
}

function detectAComponent(startTop, startLeft) {
    var component = JSON.stringify(gridConfig.data[startTop][startLeft])

    var last = {
        top: startTop,
        left: startLeft
    }

    detect(startTop, startLeft, 'right')

    function detect(top, left, type) {
        if (type == "right") {
            if (left + 1 < gridConfig.width) {
                if (component == JSON.stringify(gridConfig.data[top][left + 1])) {
                    detect(top, left + 1, "right")
                } else {
                    if (top == startTop) {
                        last.left = left
                        detect(top, startLeft, "bottom")
                    } else {
                        if (left == last.left) {
                            last.left = left
                            detect(top, startLeft, "bottom")
                        } else {
                            last.top = last.top - 1
                            console.log('Finish')
                        }
                    }
                }
            } else {
                console.log('Finish')
            }
        } else if (type == "bottom") {
            if (top + 1 < gridConfig.height) {
                if (component == JSON.stringify(gridConfig.data[top + 1][left])) {
                    last.top = top + 1
                    detect(top + 1, startLeft, "right")
                } else {
                    console.log('Finish')
                }
            } else {
                console.log('Finish')
            }
        }
    }

    return last
}

function generateButton(element, component) {
    element.classList.add('Rbutton')
    element.innerText = component.data

    element.addEventListener('click', async (event) => {
        requestButton(component.data)
    })
}

function generateScreen(element, component) {
    element.classList.add('screen')
    var status = document.createElement('div')
    status.classList.add('status')
    element.appendChild(status)
}

var wsServer = {}

function openConnection() {
    const reponse = fetch(`/config/${gridConfig.castmateConfig.hostname}/${gridConfig.castmateConfig.port}`, {
        method: "GET",
        mode: "no-cors",
    });

    const ws = new WebSocket(`ws://${gridConfig.castmateConfig.hostname}:${gridConfig.castmateConfig.port}?overlay=${gridConfig.castmateConfig.alertId}`);

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

    wsServer = ws
}

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

async function requestButton(name) {
    const reponse = await fetch("/proxy/plugins/remote/buttons/press?button=" + name, {
        method: "POST",
        mode: "no-cors",
    });
}

render()
save()