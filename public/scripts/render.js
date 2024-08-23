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

const lockedButton = document.querySelector('.settingsLock')

lockedButton.addEventListener('click', () => {
    lockedButton.classList.toggle('locked')
    if (gridConfig.locked) {
        gridConfig.locked = false
    } else {
        gridConfig.locked = true
    }
})