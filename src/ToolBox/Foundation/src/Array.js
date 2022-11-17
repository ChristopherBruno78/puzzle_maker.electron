Array.prototype.remove = function (anItem) {
  const index = this.indexOf(anItem);
  this.removeAt(index);
  return this;
};

Array.prototype.removeAt = function (index) {
  if (index > -1) {
    this.splice(index, 1);
  }
  return this;
};

Array.prototype.insertAt = function (i, ...items) {
  this.splice(i, 0, ...items);
};
