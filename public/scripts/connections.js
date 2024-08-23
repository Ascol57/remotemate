function openConnection(params) {
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

    return ws
}

function reloadConnection(ws) {
    ws.close()
    ws = new WebSocket(`ws://${gridConfig.castmateConfig.hostname}:${gridConfig.castmateConfig.port}?overlay=vlGRI9mzYdxpIBZXGPIDa`);

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
}

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