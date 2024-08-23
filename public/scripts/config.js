var gridConfig = {}

async function load() {
    if (await localStorage.getItem("RemoteMateConfig")) {
        await localStorage.setItem("actionkey", "1");

        gridConfig = JSON.parse(await localStorage.getItem("RemoteMateConfig"))
    } else {
        var gridConfig = {
            height: 4,
            width: 5,
            locked: false,
            data: [],
            castmateConfig: {
                hostname: "localhost",
                port: "8181"
            }
        }

        await localStorage.setItem("actionkey", "1");

        await localStorage.setItem("RemoteMateConfig", JSON.stringify(gridConfig));
    }
}

async function save() {
    await localStorage.setItem("actionkey", "1");
    await localStorage.setItem("RemoteMateConfig", JSON.stringify(gridConfig))
}