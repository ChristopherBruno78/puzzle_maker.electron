const PopOverOrientation = {
  Top_Left: "top_left",
  Top_Center: "top_center",
  Top_Right: "top_right",
  Bottom_Left: "bottom_left",
  Bottom_Center: "bottom_center",
  Bottom_Right: "bottom_right",
  Left_Top: "left_top",
  Left_Middle: "left_middle",
  Left_Bottom: "left_bottom",
  Right_Top: "right_top",
  Right_Middle: "right_middle",
  Right_Bottom: "right_bottom",
};

function getPosition(orientation) {
  const parts = orientation.split("_");
  return parts[0];
}

function getEdge(orientation) {
  const parts = orientation.split("_");
  return parts[1];
}

export { PopOverOrientation, getEdge, getPosition };
