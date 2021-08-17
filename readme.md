# ts-to-js-converter

Support for Recursively converting TS project files to JS (for windows)

```sh
npx ts-to-js-converter  source=../../MyExams/whiteRabbit/ECommerceApp target=ES2017 output=./output2 noResolve=true copyNonTSFile=false
```

in unix bases machine this can be done with below

```sh
npx tsc ./**/*.ts* --target es5 --outDir ../outputES5 --noResolve true --jsx preserve
```
