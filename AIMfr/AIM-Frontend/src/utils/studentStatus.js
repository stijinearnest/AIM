export const isActiveStudent = (student) => student?.is_studying !== false;

export const getStudentDepartmentId = (student) =>
  student?.department_id ??
  (typeof student?.department === "object" ? student?.department?.dep_id : student?.department) ??
  (typeof student?.department === "object" ? student?.department?.department_id : "") ??
  student?.dep_id ??
  "";

export const getPhotoSrc = (photo) => {
  if (!photo) return "";

  const photoValue = String(photo);
  const looksLikeImagePath = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(photoValue);

  if (
    photoValue.startsWith("data:") ||
    photoValue.startsWith("http") ||
    photoValue.startsWith("blob:") ||
    photoValue.startsWith("/") ||
    looksLikeImagePath
  ) {
    return photoValue;
  }

  return `data:image/jpeg;base64,${photoValue}`;
};
