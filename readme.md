# ts-to-js-converter

Support for Recursively converting TS project files to JS (for windows)

```sh
npx ts-to-js-converter --source ../../source/folder/path --output ./output2 --target ES2017 --exclude node_modules .git .gitattributes .DS_Store android ios

npx ts-to-js-converter -s ../../MyExams/whiteRabbit/ECommerceApp -o ./output2 -t ES2017 -e node_modules .git .gitattributes .DS_Store android ios
```

in unix bases machine this can be done with below

```sh
npx tsc ./**/*.ts* --target es5 --outDir ../outputES5 --noResolve true --jsx preserve
```
