import { fstat, fstatSync, lstatSync, readdirSync, Stats } from 'fs'
import * as path from 'path'
import _ from 'lodash'

export enum ItemType {
    File = "FILE",
    Folder = "FOLDER",
    SymLink = "SymLink"
}

export interface ItemInfo {
    name: string,
    type: ItemType,
    path: string,
    extension?: string,
    children?: ItemInfo[],
}

const getType = (fileStat: Stats): ItemType => {
    if (fileStat.isDirectory()) {
        return ItemType.Folder
    }

    if (fileStat.isSymbolicLink()) {
        return ItemType.SymLink
    }

    return ItemType.File
}

export const parseItem = (itemPath: string, excludeItems: string[] = []): ItemInfo => {
    const fileStat = lstatSync(itemPath)
    const type = getType(fileStat)
    const itemInfo = {
        type,
        path: itemPath,
        name: path.basename(itemPath)
    }

    if (type == ItemType.File) {
        return {
            ...itemInfo,
            extension: path.extname(itemPath)
        }
    }

    if (type === ItemType.Folder) {
        return {
            ...itemInfo,
            children: readdirSync(itemPath).map((childName) => path.join(itemPath, childName)).filter(childPath => {
                const matchesExcludeItems = _.filter(excludeItems, (excludeItem) => childPath.includes(excludeItem)).length > 0
                return !matchesExcludeItems
            }).map((childPath) => {
                return parseItem(childPath, excludeItems)
            })
        }
    }

    return itemInfo
}