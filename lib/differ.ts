export interface IRule {
  name: string;
  props: string[];
}
export class Differ {
  private _rule: IRule[] = [];

  constructor(...rule: IRule[]) {
    this._rule = rule;
  }

  public checkDifferrence(src: any, target: any) {
    if (typeof src !== typeof target) return false;

    if (typeof src === "string") {
      return src === target;
    }

    if (!Array.isArray(src)) {
      return this.checkObj(src, target);
    }

    return this.checkArray(src, target);
  }

  private checkObj(src: any, target: any) {
    for (const key in src) {
      if (!target.hasOwnProperty(key)) return false;
      if (src.hasOwnProperty(key)) {
        if (!this.checkDifferrence(src[key], target[key])) return false;
      }
    }
    return true;
  }

  private checkArray(src: any, target: any) {
    for (let index = 0; index < src.length; index++) {
      if (target.length <= index) return false;
      if (!this.checkDifferrence(src[index], target[index])) return false;
    }
    return true;
  }

  public getDifferrence(
    src: any,
    target: any,
    srcKey = undefined,
    type: "modified" | "added" | "deleted" = undefined
  ): any {
    let differenceObj = {};
    if (typeof src !== typeof target) {
      throw "typeof definition is not similar with target";
    }

    if (typeof src === "string" || typeof src === "number") {
      if (src !== target && (type === "modified")) { 
        if (srcKey == undefined) return src;
        differenceObj[srcKey] = src;
      }
      return differenceObj;
    }

    if (!Array.isArray(src)) {
      if (Array.isArray(target))
        throw "typeof definition is not similar with target";

      const objDifference = this.getObj(src, target, type);
      if (srcKey == undefined) return objDifference;
      if (Object.keys(objDifference).length > 0) {
        differenceObj[srcKey] = objDifference;
      }
      return differenceObj;
    }

    if (!Array.isArray(target))
      throw "typeof definition is not similar with target";

    const arrayDifference = this.getArray(src, target, srcKey, type);
    if (srcKey == undefined) return arrayDifference;
    if (Object.keys(arrayDifference).length > 0) {
      differenceObj[srcKey] = arrayDifference;
    }
    return differenceObj;
  }

  private getObj(
    src: any,
    target: any,
    type: "modified" | "added" | "deleted" = undefined
  ) {
    let differenceObj = {};

    if (type === "added") {
      for (const key in target) {
        if (!src.hasOwnProperty(key)) {
          differenceObj[key] = target[key];
          continue;
        }
        let differ = this.getDifferrence(src[key], target[key], key, type);
        Object.assign(differenceObj, differ);
      }
      return differenceObj;
    }

    if (type === "deleted") {
      for (const key in src) {
        if (!target.hasOwnProperty(key)) {
          differenceObj[key] = src[key];
          continue;
        }
        let differ = this.getDifferrence(src[key], target[key], key, type);
        Object.assign(differenceObj, differ);
      }
      return differenceObj;
    }

    for (const key in src) {
      if (!target.hasOwnProperty(key)) {
        continue;
      }

      if (src.hasOwnProperty(key)) {
        let differ = this.getDifferrence(src[key], target[key], key, type);
        Object.assign(differenceObj, differ);
      }
    }
    return differenceObj;
  }

  private getArray(
    src: any[],
    target: any[],
    name: string,
    type: "modified" | "added" | "deleted" = undefined
  ) {
    let differenceObj = [];
    if (type === "added") {
      for (let key = 0; key < target.length; key++) {
        const rule = this._rule.find(t => t.name === name);
        let index = -1;
        if (rule) index = this.getArrayIndex(target[key], src, rule);
        if (index === -1) {
          let differ = this.getDifferrence({}, target[key], undefined, type);
          if (Object.keys(differ).length > 0) {
            differenceObj.push(differ);
          }
          continue;
        }
        // let differ = this.getDifferrence(src[index], target[key], key, type);
        // differenceObj = [].concat(differenceObj, differ);
      }
      return differenceObj;
    }

    if (type === "deleted") {
      for (let key = 0; key < src.length; key++) {
        const rule = this._rule.find(t => t.name === name);
        let index = -1;
        if (rule) index = this.getArrayIndex(src[key], target, rule);

        if (index === -1) {
          let differ = this.getDifferrence(src[key], {}, undefined, type);
          if (Object.keys(differ).length > 0) {
            differenceObj.push(differ);
          }
          continue;
        }
        // let differ = this.getDifferrence(target[index], src[key], key, type);
        // differenceObj = [].concat(differenceObj, differ);
      }
      return differenceObj;
    }
    for (let key = 0; key < src.length; key++) {
      const rule = this._rule.find(t => t.name === name);
      let index = -1;
      if (rule) index = this.getArrayIndex(src[key], target, rule);
      if (index !== -1) {
        let differ = this.getDifferrence(
          src[key],
          target[index],
          undefined,
          type
        );
        if (Object.keys(differ).length > 0) {
          rule.props.forEach(element => {
            if (
              src[key][element] !== undefined &&
              target[index][element] !== undefined
            )
              differ[element] = src[key][element];
          });
        }
        if (Object.keys(differ).length > 0) {
          differenceObj = [].concat(differenceObj, [differ]);
        }
      }
    }
    return differenceObj;
  }
  getArrayIndex(obj: any, array: any[], rule: IRule): number {
    return array.findIndex(s => {
      for (let index = 0; index < rule.props.length; index++) {
        const element = rule.props[index];
        if (s[element] !== obj[element]) return false;
        return true;
      }
    });
  }

  getfullDifference(src: any, target: any) {
    const differrence = {};
    differrence["added"] = this.getDifferrence(src, target, undefined, "added");
    differrence["deleted"] = this.getDifferrence(
      src,
      target,
      undefined,
      "deleted"
    );
    differrence["modified"] = this.getDifferrence(
      src,
      target,
      undefined,
      "modified"
    );
    return differrence;
  }
}

// window["differ"] = Differ;

// namespace global {
//   interface Differ {
//     getfullDifference(src: any, target: any);
//   }
// }
