export const isObjectEmpty = (objectName: Object) => {
  return (
    Object.keys(objectName).length === 0 && objectName.constructor === Object
  );
};
