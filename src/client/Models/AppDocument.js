import { CPObject } from "../../ToolBox/Foundation";
import { ObservableArray } from "../../ToolBox/Foundation/src/ObservableArray";

const _Document = CPObject.extend({
  props: {
    wordEntries: new ObservableArray(),
  },
});

const AppDocument = new _Document();

export { AppDocument };
