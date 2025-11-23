const fs = require('fs');
const path = require('path');

// Папки и файлы, которые нужно ИСКЛЮЧИТЬ
const ignoreList = [
  'node_modules', 
  '.git', 
  'dist', 
  'build', 
  'package-lock.json', 
  'yarn.lock',
  'merge-project.js', // чтобы скрипт не копировал сам себя
  '.DS_Store'
];

// Расширения файлов, которые ищем
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.json'];

const outputFile = 'project_context.txt';

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (ignoreList.some(ignored => filePath.includes(ignored))) {
      return;
    }

    if (stat.isDirectory()) {
      walk(filePath, fileList);
    } else {
      if (extensions.includes(path.extname(file))) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function mergeFiles() {
  const allFiles = walk(__dirname); // Начинаем с текущей папки
  let content = '';

  console.log(`Найдено файлов: ${allFiles.length}`);

  allFiles.forEach((filePath) => {
    // Получаем относительный путь для удобства чтения
    const relativePath = path.relative(__dirname, filePath);
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Добавляем разделители, чтобы я понимал, где какой файл
    content += `\n\n================ FILE START: ${relativePath} ================\n`;
    content += fileContent;
    content += `\n================ FILE END: ${relativePath} ================\n`;
  });

  fs.writeFileSync(outputFile, content);
  console.log(`Готово! Весь код сохранен в файл: ${outputFile}`);
}

mergeFiles();