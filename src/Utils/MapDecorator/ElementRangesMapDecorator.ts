
import * as vscode from "vscode";
import { Element } from "../../extension_core/Element";
import { MapDecorator } from "./MapDecorator";

export class ElementRangesMapDecorator extends MapDecorator {

  constructor(data: Map<Element, vscode.Range[]>) {
    super(data);
  }

  getMapObject(): Map<Element, vscode.Range[]> {
    return this.decoratedMap;
  }

  add(element: Element, range: vscode.Range) {
    let elementSelected = this.get(element);
    if (elementSelected) {
      this.decoratedMap.get(elementSelected)?.push(range);
    } else {
      this.decoratedMap.set(element, [range]);
    }
  }


  override get(element: Element): Element | undefined {
    let stop = false;
    let selectedElementIndice = 0;
    let i = 0;
    let elements = Array.from(this.decoratedMap!.keys());
    while (!stop && i < elements.length) {
      if (elements[i].isEqual(element) === true) {
        stop = true;
        selectedElementIndice = i;
      };
      i++;
    }
    if (stop) {
      return elements[selectedElementIndice];
    }
    return undefined;
  }


}