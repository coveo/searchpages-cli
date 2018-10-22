const fs = require('fs');

const createDefault = _folder => {
  const folder = (_folder || '.') + '/';

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  if (!fs.existsSync(folder + 'page.html')) {
    fs.writeFileSync(
      folder + 'page.html',
      `<div id="search" class="CoveoSearchInterface" data-enable-history="true" data-design="new">

  <div class="CoveoAnalytics"></div>
  <div class="coveo-tab-section">
    <a class="CoveoTab" data-id="All" data-caption="All Content"></a>
  </div>
  <div class="coveo-search-section">
    <div class="CoveoSettings"></div>
    <div class="CoveoSearchbox" data-enable-omnibox="true"></div>
  </div>
  <div class="coveo-main-section">
    <div class="coveo-facet-column">
      <div class="CoveoFacet" data-title="Type" data-field="@objecttype" data-tab="All"></div>
      <div class="CoveoFacet" data-title="FileType" data-field="@filetype" data-tab="All"></div>
      <div class="CoveoFacet" data-title="Author" data-field="@author" data-tab="All"></div>
      <div class="CoveoFacet" data-title="Year" data-field="@year" data-tab="All"></div>
      <div class="CoveoFacet" data-title="Month" data-field="@month" data-tab="All"></div>
    </div>
    <div class="coveo-results-column">
      <div class="CoveoShareQuery"></div>
      <div class="CoveoPreferencesPanel">
        <div class="CoveoResultsPreferences"></div>
        <div class="CoveoResultsFiltersPreferences"></div>
      </div>
      <div class="CoveoTriggers"></div>
      <div class="CoveoBreadcrumb"></div>

      <div class="coveo-results-header">
        <div class="coveo-summary-section">
          <span class="CoveoQuerySummary"></span>
          <span class="CoveoQueryDuration"></span>
        </div>
        <div class="coveo-result-layout-section">
          <span class="CoveoResultLayout"></span>
        </div>
        <div class="coveo-sort-section">
          <span class="CoveoSort" data-sort-criteria="relevancy" data-caption="Relevance"></span>
          <span class="CoveoSort" data-sort-criteria="date descending,date ascending" data-caption="Date"></span>
        </div>
      </div>

      <div class="CoveoHiddenQuery"></div>
      <div class="CoveoDidYouMean"></div>
      <div class="CoveoErrorReport" data-pop-up="false"></div>

      <div class="CoveoResultList" data-layout="list" data-wait-animation="fade" data-auto-select-fields-to-include="true">
        <script id="Default" class="result-template" type="text/html" data-layout="list"><div class="coveo-result-frame">
  <div class="coveo-result-row">
    <div class="coveo-result-cell" style="width:85px;text-align:center;padding-top:7px;">
      <span class="CoveoIcon"></span>
      <div class="CoveoQuickview"></div>
    </div>
    <div class="coveo-result-cell" style="padding-left:15px;">
      <div class="coveo-result-row">
        <div class="coveo-result-cell" style="font-size:18px;">
          <a class="CoveoResultLink"></a>
        </div>
        <div class="coveo-result-cell" style="width:120px; text-align:right; font-size:12px">
          <span class="CoveoFieldValue" data-field="@date" data-helper="date"></span>
        </div>
      </div>
      <div class="coveo-result-row">
        <div class="coveo-result-cell">
          <span class="CoveoExcerpt"></span>
        </div>
      </div>
    </div>
  </div>
  <div class="coveo-result-row">
    <div class="coveo-result-cell" style="width:85px;text-align:center">
    </div>
    <div class="coveo-result-cell" style="font-size:13px;padding-left: 15px;">
      <table class="CoveoFieldTable">
        <tbody>
          <tr data-field="@author" data-caption="Author"></tr>
          <tr data-field="@source" data-caption="Source"></tr>
          <tr data-field="@language" data-caption="Language"></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</script>
      </div>

      <div class="CoveoPager"></div>
      <div class="CoveoLogo"></div>
      <div class="CoveoResultsPerPage"></div>
    </div>
  </div>
</div>
`
    );
  }

  if (!fs.existsSync(folder + 'page.js')) {
    fs.writeFileSync(folder + 'page.js', `/* add your custom javascript here - it will be added inline in the search page */\n`);
  }
  if (!fs.existsSync(folder + 'page.scss')) {
    fs.writeFileSync(folder + 'page.scss', `/* add your custom styling code here - it will be added inline in the search page */\n`);
  }
};

const getConfig = folder => {
  let config = {};
  const configFile = `${folder}/.coveo-config.json`;

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(configFile)) {
      console.warn(`\n\tCouldn't load ${configFile} file`);

      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('\nWould you like to create the config file now? ', answer => {
        if (/^y(es)?$/i.test(answer)) {
          rl.question('Org ID: ', org => {
            rl.question('API key: ', apiKey => {
              rl.question('Page ID: ', pageId => {
                rl.question('Page Name: ', pageName => {
                  rl.question('Page Title: ', pageTitle => {
                    rl.close();
                    console.log('creating file:  ', configFile);
                    config = { org, pageId, pageName, pageTitle, apiKey };
                    fs.writeFileSync(configFile, JSON.stringify(config, 2, 2));
                    fs.chmodSync(configFile, 0600);
                    resolve(config);
                  });
                });
              });
            });
          });
        } else {
          rl.close();
          process.exit();
        }
      });
    } else {
      try {
        config = fs.readFileSync(configFile);
        config = JSON.parse(config);
        resolve(config);
      } catch (e) {
        reject(e);
      }
    }
  });
};

module.exports = {
  createDefault,
  getConfig,
};
