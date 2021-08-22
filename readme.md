# ts-to-js-converter

## _Needed only for Windows_

Tool for iteratively converting TS files in a project files to JS (needed only for windows)

```sh
npx ts-to-js-converter --source ../../source/folder/path --output ./output/directory --target ES2017 --exclude node_modules .git .gitattributes .DS_Store android ios

npx ts-to-js-converter -s .../../source/folder/path -o ./output/directory -t ES2017 -e node_modules .git .gitattributes .DS_Store android ios
```

| options       | alias | description                                          |
| :------------ | :---- | :--------------------------------------------------- |
| source        | s     | Source directory to be parsed.                       |
| output        | o     | Output directory where the folder exists.            |
| target        | t     | Default: ES2017, specify other options.              |
| noResolve     | r     | Default: true, if false resolve dependencies as well |
| copyNonTSFile | c     | Default: false, if true copy Non TS File             |
| exclude       | e     | optional, specify files with spaces                  |

## _NOT needed in UNIX based machines (Mac or Linux)_

In unix bases machine this can be done with below

```sh
npx tsc ./**/*.ts* --target es5 --outDir ../outputES5 --noResolve true --jsx preserve
```
