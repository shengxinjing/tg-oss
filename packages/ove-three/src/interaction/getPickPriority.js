const priorityByType = {
  translation: 90,
  cutsite: 80,
  primer: 70,
  feature: 60,
  part: 55,
  orf: 50,
  annotation: 40
};

export default function getPickPriority(userData = {}) {
  return (
    priorityByType[userData.annotationType] ||
    priorityByType[userData.kind] ||
    0
  );
}
