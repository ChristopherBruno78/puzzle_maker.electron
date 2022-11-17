import { CPObject } from "../../../Foundation";

const _FileChooser = CPObject.extend({
  init() {
    const input = document.createElement("input");
    input.style.display = "none";
    input.setAttribute("type", "file");

    this.priv.input = input;
  },
  run() {
    this.priv.input.click();
    return new Promise((done, err) => {
      let changeListener;
      this.priv.input.addEventListener(
        "change",
        (changeListener = (evt) => {
          const file = evt.target.files[0];
          if (!file) {
            this.priv.input.removeEventListener("change", changeListener);
            err();
            return;
          }
          const reader = new FileReader();
          let readerListener;
          reader.addEventListener(
            "load",
            (readerListener = (fileEvt) => {
              const content = fileEvt.target.result;
              this.priv.input.value = "";
              reader.removeEventListener("load", readerListener);
              this.priv.input.removeEventListener("change", changeListener);
              done(content);
            })
          );
          reader.readAsText(file);
        })
      );
    });
  },
});

const FileChooser = new _FileChooser();

export { FileChooser };
