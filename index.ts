import fse, { ensureDir } from "fs-extra";
import { exec } from "child_process";
import path from "path";
import _ from "lodash";
import Bluebird from "bluebird";
import cmdArgs from "command-line-args";
import { ItemInfo, parseItem, ItemType } from "./fsUtils";

const argDefinitions = [
  { name: "source", alias: "s", type: (src) => path.normalize(src) },
  { name: "output", alias: "o", type: (out) => path.normalize(out) },
  { name: "target", alias: "t", type: String, defaultValue: "ES2017" },
  { name: "noResolve", alias: "r", type: Boolean, defaultValue: true },
  { name: "copyNonTSFile", alias: "c", type: Boolean, defaultValue: false },
  { name: "exclude", alias: "e", type: String, multiple: true },
];

const convertedExtensions = [
  {
    source: ".ts",
    destination: ".js",
  },
  {
    source: ".tsx",
    destination: ".jsx",
  },
];

const execTSC = async (
  sourceFile: string,
  outDir = "./tmp",
  target = "ES2017",
  noResolve = false,
  preserveJSX = true
) => {
  return new Promise((resolve, reject) => {
    const tscExecCode = `npx tsc ${sourceFile} --target ${target} --outDir ${outDir} --noResolve ${noResolve}${
      preserveJSX ? " --jsx preserve" : ""
    }`;
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

const getExtension = (extension) => {
  return _.find(convertedExtensions, (conversion) =>
    _.isEqual(conversion.source, extension)
  )?.destination;
};

const findGeneratedFilePath = async (
  fileInfo,
  generatedFolder,
  pathRelativeToSource
) => {
  const extension = fileInfo.extension as string;
  const baseName = path.basename(fileInfo.path, extension);
  const generatedFileExtension = getExtension(extension);
  const newFileName = `${baseName}${generatedFileExtension}`;

  const possiblePaths = [
    path.join(generatedFolder, pathRelativeToSource, newFileName), // created with similar folder path to source file
    path.join(generatedFolder, newFileName), // created at root of destination
  ];
  const foundPaths = await Bluebird.filter(possiblePaths, (path) =>
    fse.pathExists(path)
  );
  return _.first(foundPaths);
};

const main = async () => {
  const { source, output, target, noResolve, copyNonTSFile, exclude } =
    cmdArgs(argDefinitions);

  const _tmpDir = path.normalize("./tmp");
  const sourceTree: ItemInfo = parseItem(source as string, exclude);
  const flattenedFiles = flattenItems([sourceTree]);
  await fse.ensureDir(_tmpDir);

  const results = await Bluebird.mapSeries(flattenedFiles, async (fileInfo) => {
    if (fileInfo.type !== ItemType.File) {
      return {
        status: "NOT_REQUIRED",
        path: fileInfo.path,
        type: fileInfo.type,
      };
    }

    await fse.remove(_tmpDir);
    await fse.ensureDir(_tmpDir);

    const sourceFolder = path.dirname(fileInfo.path);
    const pathFromSource = path.normalize(sourceFolder.replace(source, ""));
    const destinationDir = path.join(output, pathFromSource);

    await fse.ensureDir(destinationDir);
    const isTSFile = _.includes([".ts", ".tsx"], fileInfo.extension);

    if (!isTSFile && copyNonTSFile) {
      const destinationPath = path.join(destinationDir, fileInfo.name);
      await fse.copy(fileInfo.path, destinationPath);
      return {
        ...fileInfo,
        status: "SUCCESS",
      };
    }

    try {
      await execTSC(fileInfo.path, _tmpDir, target, noResolve);
    } catch (error) {
      console.log(error);
    } finally {
      const extension = fileInfo.extension as string;
      const baseName = path.basename(fileInfo.path, extension);
      const newFileName = `${baseName}${getExtension(extension)}`;
      const destinationPath = path.join(destinationDir, newFileName);

      const generatedFile = await findGeneratedFilePath(
        fileInfo,
        _tmpDir,
        pathFromSource
      );

      if (!_.isEmpty(generatedFile)) {
        await fse.copy(generatedFile, destinationPath);
        return {
          ...fileInfo,
          status: "SUCCESS",
          generatedFile,
        };
      }

      return {
        ...fileInfo,
        status: "FAILED",
        generatedFile,
      };
    }
  });

  console.log(
    `FAILED FILES:\n\n ${JSON.stringify(
      results.filter((result) => _.isEqual(result.status, "FAILED"))
    )}`
  );
};

main();
