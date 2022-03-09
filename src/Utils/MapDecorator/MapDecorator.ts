import { Element } from "../../extension_core/Element";
import * as vscode from "vscode";

export class MapDecorator  {

    // Protected variable
    decoratedMap: Map<any, any>;

    constructor(data: Map<any, any[]>) {
        this.decoratedMap = data;
    }

    clear(): void {
        this.decoratedMap.clear();
    }
    delete(anyey: any): boolean {
       return this.decoratedMap.delete(anyey);
    }
    forEach(callbacanyfn: (value: any, anyey: any, map: Map<any, any>) => void, thisArg?: any): void {
        throw new Error("Method not implemented.");
    }
    get(anyey: any): any | undefined {
        throw new Error("Method not implemented.");
    }
    has(anyey: any): boolean {
        throw new Error("Method not implemented.");
    }
    set(anyey: any, value: any): this {
        throw new Error("Method not implemented.");
    }
    size: number | undefined;
    entries(): IterableIterator<[any, any]> {
        throw new Error("Method not implemented.");
    }
    anyeys(): IterableIterator<any> {
        throw new Error("Method not implemented.");
    }
    values(): IterableIterator<any> {
        throw new Error("Method not implemented.");
    }
    [Symbol.iterator](): IterableIterator<[any, any]> {
        throw new Error("Method not implemented.");
    }
}