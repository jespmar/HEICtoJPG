const remote = require('electron').remote;
const fs = require('fs');

const path = require('path')

const {
    promisify
} = require('util');
const convert = require('heic-convert');

let outputField
let startedField
let files = []

async function conv(file) {


    const inputBuffer = await promisify(fs.readFile)(file);
    const outputBuffer = await convert({
        buffer: inputBuffer, // the HEIC file buffer
        format: 'JPEG', // output format
        quality: 1 // the jpeg compression quality, between 0 and 1
    });

    const newFile = file.replace("HEIC", "jpg");

    await promisify(fs.writeFile)(`${newFile}`, outputBuffer).then(() => console.log('file von'));

    console.log('file converted')
}


function conFile(file) {

    const newFile = file.replace("HEIC", "jpg");

    convert({
        buffer: fs.readFileSync(file),
        format: 'JPEG',
        quality: 1
    }).then((buffer) => {
        fs.writeFile(newFile, buffer, (err) => {
            if (err) {
                console.error(err)
            } else {
                console.log(path.basename(file) + ' Converted')
                updateOutput(file);
            }
        })
    })
}

const setStatus = (message) => new Promise((resolve, reject) => {
    startedField.innerHTML = message
    resolve('done')
})

remote.getCurrentWindow().webContents.on('did-finish-load', () => {

    const select = document.getElementById('select')
    outputField = document.getElementById('outputField')
    startedField = document.getElementById('startedField')

    select.onclick = () => {

        let filesToRun

        remote.dialog.showOpenDialog(null, {
                properties: ['openFile', 'multiSelections'],
                filters: [{
                    name: 'Images',
                    extensions: ['heic']
                }, ]
            })
            .then((res) => {
                if (!res.canceled) {
                    startedField.innerHTML = '<p>File conversion started... This may take a while! Just hang in there!</p>'
                    setTimeout(() => {
                        setStatus('<p>File conversion started... This may take a while! Just hang in there!</p>')
                            .then((r) => {
                                console.log(r);
                                runAll(res.filePaths)
                            })
                    }, 1000)


                }
            })
        // @ts-ignore

    }

});


const runAll = (filePaths) => {
    for (let i = 0; i < filePaths.length; i++) {
        // @ts-ignore
        console.log('runnig file: ' + filePaths[i])
        // @ts-ignore
        conFile(filePaths[i])
    }
}



const updateOutput = (file) => {
    files.push(file)

    let output

    for (let i = 0; i < files.length; i++) {
        if (output === undefined) {
            output = `<li>${path.basename(file)} ==> ${file.replace("HEIC", "jpg")}</li>`
        } else {
            output = output + `<li>${path.basename(file)} ==> ${file.replace("HEIC", "jpg")}${file}</li>`
        }
    }

    outputField.innerHTML = output
}