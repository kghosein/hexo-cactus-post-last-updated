# hexo-cactus-post-last-updated

Hexo plugin to show last updated date in your cactus theme posts.

## Limitations

- Might work for other themes as well but it was tested with cactus theme only.
- Expects that posts names are unique and never changed in posts directory (in cactus theme this directory is `/source/_posts`, you can change dir path in `/node_modules/hexo-cactus-post-last-updated/index.js` file if you have a different path).

## How To Use?

```
npm i hexo-cactus-post-last-updated
```

## How It Works?

When you will run plugin for the first time it will generate a ***data*** folder in root theme directory with other dirs such as **/source**, **/scaffolds** etc. The ***data*** dir will have 2 files

- **data.json**
- **initialLengths.json**

Notable file here is **data.json** file, it consists of the following information about each post

- "filename", post name
- "fileContentInitialLength", the length of content first recorder when plugin queried your posts for the first time, it will be a constant value
- "fileContentUpdatedLength", the length of content updated each time when you make any changes in your posts, it will be a variable value
- "fileContentDateUpdated", date saved when a change is detected in "fileContentUpdatedLength" in yy:mm:dd format

**Tip:** Since ***data*** folder is serving as a database to save last updated dates of your posts so its better to take a regular backup of this folder.

## Setup Plugin

In order to use this plugin you will need to create 2 files in your theme **last_updated.js** and **date_updated.ejs**.

`last_updated.js` create this file `/themes/cactus/scripts/`
```
const fs = require('fs');
const path = require('path');

hexo.extend.helper.register('last_updated', function (post) {
  // post is post title coming from date_updated.ejs
  const dataPath = path.join(hexo.base_dir, 'data', 'data.json');
  const data = JSON.parse(fs.readFileSync(dataPath));

  let lastUpdatedDate;
  data.map((el) => {
    const jsonFilename = el.filename.replace(/-|\.md/g, ' ').trim();
    if (jsonFilename == post) {
      lastUpdatedDate = el.fileContentDateUpdated;
    }
  });

  return lastUpdatedDate;
});
```
This script will query **data.json** in ***data*** dir and return last updated date (if any) for a post.

To show this date in your frontend you will need to create another file 

`date_updated.ejs` in `/themes/cactus/layout/_partial/post/`
```
<% if (post.title) { %>
  <% const updatedDate=last_updated(post.title) %>
  <% if (updatedDate) { %>
    <span><span>&nbsp;&nbsp;&nbsp;</span>Last Updated:
      <time>
        <%= updatedDate %>
      </time>
    </span>
  <% } %>
<% } %>
```
This ejs script will show the return date from **last_updated.js**.

**Final step** is to include **date_updated.ejs** in `/themes/cactus/layout/post.ejs` file, 

look for 
```
<%- partial('_partial/post/date', { post: page, class_name: 'postdate' }) %>
```
line in **post.ejs** file and right below this line add
```
<%- partial('_partial/post/date_updated', { post: page, class_name: 'postdate' }) %>
```

Now run `hexo server` command and you can see last updated date on your posts right after the published date.

## Notes

Suggestions and contributions are always welcomed, I request you to please help me improve this plugin and contribute to this repo. If faced any malfunctioning, please open issues. Happy Coding!

---