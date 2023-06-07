function testFileSystemAccesAPISupport() {
    if ('showSaveFilePicker' in window && 'createWritable' in FileSystemFileHandle.prototype) {
        return true;
    } else {
        console.log('File System Access API not supported');
        return false;
    }
}


export async function saveObjAsJson(obj, suggestedName = "data.json") {
    if (!testFileSystemAccesAPISupport()) {return};
    const jsonString = JSON.stringify(obj, null, 2);
    const jsonBlob = new Blob([jsonString], { type: 'application/json' });

    try {
        const fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [
            {
            description: 'JSON File',
            accept: {
                'application/json': ['.json'],
            },
            },
        ],
        });

        const writableStream = await fileHandle.createWritable();
        await writableStream.write(jsonBlob);
        await writableStream.close();

        console.log('JSON saved successfully!');
    } catch (err) {
        console.error('Error while saving JSON file:', err);
    }
}

export async function loadJsonAsObj(obj) {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [
            {
                description: 'JSON File',
                accept: {
                'application/json': ['.json'],
                },
            },
            ],
        });

        const file = await fileHandle.getFile();
        const fileContents = await file.text();
        const jsonObject = JSON.parse(fileContents);
        console.log('JSON file loaded and parsed:');
        return jsonObject;
    } catch (err) {
        console.error('Error while loading and parsing JSON file:', err);
    }
    return null;
}

export async function saveCanvasImage(canvas) {
    if (!testFileSystemAccesAPISupport()) {return};
    try {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve));
        const fileHandle = await window.showSaveFilePicker({
        types: [
            {
            description: 'Image files',
            accept: {
                'image/png': ['.png'],
            },
            },
        ],
        });
    
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();
    
        console.log('Image saved successfully');
    } catch (err) {
        console.error('Error saving image:', err);
    }
}

export class ImageSequenceSaver {

    async showDirectoryPicker() {
        if (!testFileSystemAccesAPISupport()) {return};
        this.folderHandle = await window.showDirectoryPicker();
        this.initialized = true;
        this.count = 0;
    }

    async saveCanvasImage(canvas) {
        if (!this.initialized) {return;}
        try {
            const blob = await new Promise((resolve) => canvas.toBlob(resolve));

            const numString = this.count.toString().padStart(6, '0');
            const fileName = `image${numString}.png`
            this.count ++;
            const fileHandle = await this.folderHandle.getFileHandle(fileName, {
            create: true,
            });
    
            const writableStream = await fileHandle.createWritable();
            await writableStream.write(blob);
            await writableStream.close();
    
            console.log(`saved ${fileName}`);
        } catch (err) {
          console.error('Error saving images:', err);
        }
    }
}

export async function loadText(url) {
    const response = await fetch(url);
    return await response.text();
}