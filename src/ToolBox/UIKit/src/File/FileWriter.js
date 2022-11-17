import { CPObject } from "../../../Foundation";

const _FileWriter = CPObject.extend({
  init() {
    const input = document.createElement("a");
    input.style.display = "none";
    this.priv.input = input;
  },
  run(data) {
    return new Promise((done) => {
      const input = this.priv.input;
      input.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(data)
      );
      input.setAttribute("download", "words.csv");
      input.click();
      done();
    });
  },
});

const FileWriter = new _FileWriter();

export { FileWriter };
