'use strict';

const fs = require('fs');
const path = require('path');

try {
  if (hexo.env.cmd === 'server' || hexo.env.deploy) {
    const postsDirectory = path.join(__dirname, '../../source/_posts/');
    if (!fs.existsSync(path.join(__dirname, '../../data'))) {
      fs.mkdirSync(path.join(__dirname, '../../data'));
    }
    const postFiles = fs.readdirSync(postsDirectory);

    let initialLengths = {};
    const initialLengthsFilePath = path.join(__dirname, '../../data', 'initialLengths.json');
    if (fs.existsSync(initialLengthsFilePath)) {
      const initialLengthsFileContent = fs.readFileSync(initialLengthsFilePath, 'utf-8');
      initialLengths = JSON.parse(initialLengthsFileContent);
    }

    function updatePostList() {
      const postList = postFiles.map((filename) => {
        const postPath = path.join(postsDirectory, filename);
        const stats = fs.statSync(postPath);
        const fileContent = fs.readFileSync(postPath, 'utf-8');

        let fileContentInitialLength = 0;
        if (filename in initialLengths) {
          fileContentInitialLength = initialLengths[filename];
        } else {
          fileContentInitialLength = stats.size;
          initialLengths[filename] = fileContentInitialLength;
          fs.writeFileSync(initialLengthsFilePath, JSON.stringify(initialLengths, null, 2));
        }

        let fileContentDateUpdated = null;
        const dataJsonPath = path.join(__dirname, '../../data');

        try {
          function updateDate(datePostUpdated) {
            if (fs.existsSync(dataJsonPath)) {
              const dataJsonPath = path.join(__dirname, '../../data', 'data.json');
              const dataJson = fs.readFileSync(dataJsonPath, 'utf-8');
              const data = JSON.parse(dataJson);
              const post = data.find((p) => p.filename === filename);
              if (post && post.fileContentUpdatedLength !== fileContent.length) {
                let date_ob = new Date();
                let date = ("0" + date_ob.getDate()).slice(-2);
                let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                let year = date_ob.getFullYear();
                // let hours = date_ob.getHours();
                // let minutes = date_ob.getMinutes();
                datePostUpdated = `${year}-${month}-${date}`;
                return datePostUpdated;
              }
              else {
                if (fs.existsSync(dataJsonPath)) {
                  const dataJson = fs.readFileSync(dataJsonPath, 'utf-8');
                  const data = JSON.parse(dataJson);
                  const post = data.find((p) => p.filename === filename);
                  const lastUpdateDate = post.fileContentDateUpdated;
                  return lastUpdateDate;
                }
              }
            }
          }

          let datePostUpdated = null;
          let updateDateReturnValue = updateDate(datePostUpdated);
          if (updateDateReturnValue) {
            fileContentDateUpdated = updateDateReturnValue;
          } else {
            fileContentDateUpdated = null;
          }
        } catch (error) { }

        return {
          filename,
          fileContentInitialLength,
          fileContentUpdatedLength: fileContent.length,
          fileContentDateUpdated,
        };
      });

      const jsonOutput = JSON.stringify(postList, null, 2);
      fs.writeFileSync(path.join(__dirname, '../../data', 'data.json'), jsonOutput);
    }

    updatePostList();

    fs.watch(postsDirectory, (eventType, filename) => {
      if (eventType === 'change' && filename && filename.endsWith('.md')) {
        postFiles.splice(postFiles.indexOf(filename), 1, filename);
        updatePostList();
      }
    });
  }

} catch (error) { }