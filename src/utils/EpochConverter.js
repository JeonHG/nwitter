const EpochConverter = ( createdAt ) => {
  const date = new Date(createdAt);
  return date.toString().replace("GMT+0900", " ");
};
export default EpochConverter;
