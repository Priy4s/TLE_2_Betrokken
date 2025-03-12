import fs from 'fs'
import path from 'path'

const directory = './videos';

fs.readdir(directory, (err, files) => {
    if(err) {
        console.log("Error with reading directory", err)
        return;
    }

    files.forEach((file) => {
        const oldPath = path.join(directory, file);
        const newFileName =  file.replace(/\s/g, '-');
        const newPath = path.join(directory, newFileName);

        if(oldPath !== newPath) {
            fs.rename(oldPath, newPath,  (err) => {
                if(err) {
                    console.log(`Error with changing the name ${file}`, err);
                } else {
                    console.log(`Name change was a succes!: ${file} => ${newFileName}`)
                }
            })
        }
    })
})