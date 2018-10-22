# SearchPages-cli

## Description
A simple Command line tool to package and update Search Pages into a Coveo organization.

## Available documentation

- [Online Help for Search Pages](https://docs.coveo.com/en/1656/)
- [Rest API for search pages](https://platform.cloud.coveo.com/docs?api=SearchApi#!/Organizations/put_rest_organizations_organizationId_pages_id)

## Contributing to this project
- Branch
- Pull Request
- And... that's pretty much it!

## How-to install

The easy way if to grab it from NPM:
1. `npm i -g coveo-searchpages-cli`
2. then use `update-searchpage` from the folder with the html & javascript code.

Or you can build it:
1. `git clone` this project
1. `npm install` to get the dependencies (request, fs)


## How-to run

- `update-searchpage -init my_folder`
- `update-searchpage my_folder`

## What does it do?

It packages the files `page.html`, `page.scss`, and `page.js` into one `generated.html` and uploads this generated file into your Coveo organization (defined in the config).
It will validate if the current version in the server matches the last one that was uploaded. Look in the warnings to see how to resolve conflicts.
This is to avoid losing changes that were made by other contributors and changes done with the Interface Editor.

## Dependencies
- Node.js
- Node modules: `fs`, `md5`, `node-sass`

## Authors
- Jérôme Devost (https://github.com/jdevost)
