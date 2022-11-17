import { MakePoint, PointDifference } from "../../utils/Geometry";
import { _selectMovePercent } from "./constants";

function _removeSelectionEvents(aScrollView) {
  const contentView = aScrollView.contentView;
  contentView.node.removeEventListener(
    "pointerdown",
    aScrollView.priv.sel_ptdl
  );
  contentView.node.removeEventListener("pointerup", aScrollView.priv.sel_ptul);
  contentView.node.removeEventListener(
    "pointermove",
    aScrollView.priv.sel_ptml
  );
}

function _addSelectionEvents(aScrollView) {
  const contentView = aScrollView.contentView;
  contentView.node.addEventListener(
    "pointerdown",
    (aScrollView.priv.sel_ptdl = (evt) => {
      aScrollView.priv.sel_ptd = true;
      contentView.node.setPointerCapture(evt.pointerId);
    })
  );

  contentView.node.addEventListener(
    "pointerup",
    (aScrollView.priv.sel_ptul = (evt) => {
      aScrollView.priv.sel_ptd = false;
      contentView.node.releasePointerCapture(evt.pointerId);
    })
  );

  contentView.node.addEventListener(
    "pointermove",
    (aScrollView.priv.sel_ptml = (evt) => {
      const node = aScrollView.node;
      if (aScrollView.priv.sel_ptd) {
        const selection = window.getSelection();
        if (selection) {
          const r = node.getBoundingClientRect();
          const start = MakePoint(r.left, r.top);
          const end = MakePoint(r.right, r.bottom);
          const current = MakePoint(evt.pageX, evt.pageY);

          const diffEnd = PointDifference(current, end);
          if (diffEnd.y > 0) {
            aScrollView.scrollTop =
              aScrollView.props.scrollTop + _selectMovePercent * diffEnd.y;
          }
          if (diffEnd.x > 0) {
            aScrollView.scrollLeft =
              aScrollView.props.scrollLeft + _selectMovePercent * diffEnd.x;
          }

          const diffStart = PointDifference(start, current);
          if (diffStart.y > 0) {
            aScrollView.scrollTop =
              aScrollView.props.scrollTop - _selectMovePercent * diffStart.y;
          }
          if (diffStart.x > 0) {
            aScrollView.scrollLeft =
              aScrollView.props.scrollLeft - _selectMovePercent * diffStart.x;
          }
        }
      }
    })
  );
}

export { _addSelectionEvents, _removeSelectionEvents };
