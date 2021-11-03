const fs = require('fs'),
  md5 = require('md5'),
  request = require('request'),
  sass = require('sass');

let generatePage = (PAGE_FOLDER) => {
  let hostedSearchPage = sass.renderSync({
    file: PAGE_FOLDER + '/page.scss',
    outFile: PAGE_FOLDER + '/page.css'
  });

  let html = fs.readFileSync(PAGE_FOLDER + '/page.html');
  // Replace <template id="x"/> by the file templates/x.html
  html = ('' + html).replace(/<template\s+id="\w+"\s*\/?\s*>/g, templateTag => {
    let templateId = '';
    if (/\bid="(\w+)"/.test(templateTag)) {
      templateId = RegExp.$1;
      let templateCode = null;
      try {
        templateCode = fs.readFileSync(`${PAGE_FOLDER}/templates/${templateId}.html`);
      } catch (e) {
        console.log(e);
      }
      return templateCode || '';
    }
  });

  let css = hostedSearchPage.css;
  let script = fs.readFileSync(PAGE_FOLDER + '/page.js');

  let generated_page = [
    html,
    '<style type="text/css">',
    css,
    '</style>',
    '<script>',
    script,
    '</script>\n'].join('\n');//.replace(/\n(\s|\n)+/g,'\n');

    fs.writeFileSync(`${PAGE_FOLDER}/.generated.html`, generated_page);

    return generated_page;
};


let getServerCopy = (PAGE_FOLDER, config)=>{
  const PAGE_URL = `https://${config.platform || 'platform.cloud.coveo.com'}/rest/organizations/${config.org}/pages/${config.pageId}`;

  return new Promise((resolve, reject)=>{
    request({
        method: 'GET',
        url: PAGE_URL,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${config.apiKey}`
        }
      },
      (err, httpResponse, body)=>{
        if (err) {
          console.log('ERROR: ', err);
          reject(err);
        }
        console.log(`\nhttpResponse STATUS: ${httpResponse.statusCode}\n`);

        let hash = '';
        if (httpResponse.statusCode === 200) {
          let html = JSON.parse(body).html;
          hash = md5(html);
          fs.writeFileSync(`${PAGE_FOLDER}/.server.copy.html`, html);
          fs.writeFileSync(`${PAGE_FOLDER}/.server.copy.md5`, hash);
        }
        else {
          console.log('Server copy not found or failed.');
        }
        resolve(hash);
      }
    );
  });
};

let putPage = (PAGE_FOLDER, config, generated_page)=> {
  const PAGE_URL = `https://${config.platform || 'platform.cloud.coveo.com'}/rest/organizations/${config.org}/pages/${config.pageId}`;
  console.log('URL:', PAGE_URL, '\n\t', generated_page.length, '\n\t', md5(generated_page));

  return request({
      method: 'PUT',
      url: PAGE_URL,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        name: config.pageName,
        title: config.pageTitle,
        html: generated_page
      })
    },
    (err, httpResponse, body)=>{
      if (err) {
        console.log('ERROR: ', err);
      }
      console.log('DONE: ', httpResponse.statusCode, body, '\n\n');
      fs.writeFileSync(`${PAGE_FOLDER}/.cache.html`, generated_page);
      fs.writeFileSync(`${PAGE_FOLDER}/.cache.md5`, md5(generated_page));
  }
  );
};


let deploy = (PAGE_FOLDER, config)=> {
  console.log(`Deploying ${config.pageName} to Search pages in Org ${config.org}.`);

  getServerCopy(PAGE_FOLDER, config).then(serverHash=>{
    let cachedHash = null;
    try {
      cachedHash = fs.readFileSync(`${PAGE_FOLDER}/.cache.md5`, 'utf-8');
    }
    catch(e) {
      console.log(`Failed to get ${PAGE_FOLDER}/.cache.md5`);
    }
    console.log('hash:', serverHash, cachedHash);

    let page = generatePage(PAGE_FOLDER);
    let generatedPageHash = md5(page);

    if (generatedPageHash === serverHash) {
      console.log('\nNo modifications to the page. SKIPPED.\n');
    }
    else if (!cachedHash) {
      // no previous hash, can't compare. Probably the first deploy from this machine. We do it, with a warning.
      console.log(`\n\nWARNING:\nCouldn't validate server copy wasn't updated. Double check you aren't overriding previous changes using file .server.copy.html\n`);
      putPage(PAGE_FOLDER, config, page);
    }
    else if (cachedHash === serverHash) {
      console.log(`\nServer copy wasn't modified since last time. Safe to update.\n`);
      putPage(PAGE_FOLDER, config, page);
    }
    else {
      console.log(`\n\nWARNING:\nServer copy isn't matching local cached copy. The server copy must have been updated.\n\nYou can compare files .server.copy.html and .generated.html\nDouble check if you need to merge, then delete file ".cache.md5" to overwrite server copy.\n`);
    }
  });


};

module.exports = deploy;
