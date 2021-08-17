import { argv } from "process";
import { ItemInfo, parseItem, ItemType } from "./fsUtils";
import _ from "lodash";
import { exec } from "child_process";
import Bluebird from "bluebird";
import fse, { ensureDir } from "fs-extra";
import path from "path";

const excludeArgs = ["ts-node", "index.ts"];

const excludeItems = [
  "node_modules",
  "android",
  "ios",
  ".git",
  ".DS_Store",
  ".buckconfig",
  ".editorconfig",
  ".eslintrc.js",
  ".gitattributes",
  "prettierrc.js",
  ".watchmanconfig",
  "sample_screens",
];

const validArgs = argv
  .filter((value) => {
    return _.filter(excludeArgs, (arg) => value.includes(arg)).length <= 0;
  })
  .map((arg) => arg.split("="))
  .reduce((acc: any, keyVal: string[]): any => {
    const key: string = keyVal.shift() as string;
    return {
      ...acc,
      [key]: _.isEmpty(keyVal)
        ? key
        : _.size(keyVal) > 1
          ? keyVal
          : _.first(keyVal),
    };
  }, {});

const exec_tsc = async (
  sourceFile: string,
  outDir = "./tmp",
  target = "ES2017",
  noResolve = false
) => {
  return new Promise((resolve, reject) => {
    const tscExecCode = `npx tsc ${sourceFile} --target ${target} --outDir ${outDir} --noResolve ${noResolve}`;
    console.log(tscExecCode);
    exec(tscExecCode, (error, stdout, stderr) => {
      console.log(error, stdout, stderr);
      if (!error) {
        resolve(stdout);
      }
      if (error) {
        reject(error);
      }
    });
  });
};

const flattenItems = (itemInfos: ItemInfo[]): ItemInfo[] => {
  let items: ItemInfo[] = [];
  for (const itemInfo of itemInfos) {
    const trimmedItemInfo = { ...itemInfo };
    _.unset(trimmedItemInfo, "children");
    items = [...items, trimmedItemInfo];
    if (itemInfo.children) {
      items = [...items, ...flattenItems(itemInfo.children)];
    }
  }
  return items;
};

const main = async () => {
  const { source, output, target = "ES2017", noResolve = true, copyNonTSFile = false } = validArgs;
  const tmpDir = "./tmp";
  const sourceTree: ItemInfo = parseItem(source as string, excludeItems);
  const flattenedFiles = flattenItems([sourceTree]);
  await fse.ensureDir(tmpDir);
  const results = await Bluebird.mapSeries(flattenedFiles, async (fileInfo) => {
    if (fileInfo.type !== ItemType.File) {
      return {
        status: 'NOT_REQUIRED',
        path: fileInfo.path,
        type: fileInfo.type
      };
    }

    await fse.remove(tmpDir);
    await fse.ensureDir(tmpDir);

    const sourceFolder = path.dirname(fileInfo.path);
    const trimmedFolder = sourceFolder.replace(source, "");
    const destinationDir = path.join(output, trimmedFolder);

    await fse.ensureDir(destinationDir);
    const isTSFile = _.includes([".ts", ".tsx"], fileInfo.extension);

    if (!isTSFile && copyNonTSFile) {
      const destinationPath = path.join(destinationDir, fileInfo.name);
      await fse.copy(fileInfo.path, destinationPath);
      return {
        ...fileInfo,
        status: 'SUCCESS'
      };
    }

    try {
      await exec_tsc(fileInfo.path, tmpDir, target, noResolve);
    } catch (error) {
      console.log(error);
    } finally {
      const extension = fileInfo.extension as string;
      const baseName = path.basename(fileInfo.path, extension);

      const destinationPath = path.join(
        destinationDir,
        `${baseName}${extension.replace(".ts", ".js")}`
      );
      const tmpConvertedFullPath = path.join(
        tmpDir,
        trimmedFolder,
        fileInfo.name.replace(extension, ".js")
      );
      const tmpFullPathExists = await fse.pathExists(tmpConvertedFullPath);
      if (tmpFullPathExists) {
        await fse.copy(tmpConvertedFullPath, destinationPath);
        return {
          ...fileInfo,
          status: 'SUCCESS'
        };
      }

      const tmpHighLevelPath = path.join(
        tmpDir,
        fileInfo.name.replace(extension, ".js")
      );
      const tmpHighLevelPathExists = await fse.pathExists(tmpHighLevelPath);
      if (tmpHighLevelPathExists) {
        await fse.copy(tmpHighLevelPath, destinationPath);
        return {
          ...fileInfo,
          status: 'SUCCESS'
        };
      }
      return {
        ...fileInfo,
        status: 'FAILED',
        failedTmpPaths: [tmpConvertedFullPath, tmpHighLevelPath]
      };
    }
  });

  console.log(`FAILED FILES:\n\n ${JSON.stringify(results.filter(result => _.isEqual(result.status, 'FAILED')))}`)

};
main();

// console.log(tsFiles)

//console.log('items:', JSON.stringify(parseItem('./', ['node_modules'])))
