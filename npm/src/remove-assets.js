const fs = require('fs').promises;
const path = require('path');

async function findAndDeleteCssFiles(dir) {
    try {
        removeDir = path.join(__dirname, dir)
        const files = await fs.readdir(dir, { withFileTypes: true });
        for (const file of files) {
            const filePath = path.join(dir, file.name);
            if (file.isDirectory()) {
                await findAndDeleteCssFiles(filePath);
            } else if (file.name.endsWith('.css')) {
                await fs.unlink(filePath);
                console.log(`Deleted: ${filePath}`);
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}


findAndDeleteCssFiles('../npm/dist');