/**
 * Shared faculty list used by every service form. Values are identical across
 * services; only the visible labelling differs (iThenticate prefixes a number).
 */
export const FACULTIES = [
  "คณะแพทยศาสตร์ (Faculty of Medicine)",
  "คณะทันตแพทยศาสตร์ (Faculty of Dentistry)",
  "คณะเภสัชศาสตร์ (Faculty of Pharmaceutical Sciences)",
  "คณะพยาบาลศาสตร์ (Faculty of Nursing)",
  "คณะวิทยาศาสตร์ (Faculty of Science)",
  "คณะวิศวกรรมศาสตร์ (Faculty of Engineering)",
  "คณะวิทยาการจัดการ (Faculty of Management Sciences)",
  "คณะศิลปศาสตร์ (Faculty of Liberal Arts)",
  "คณะทรัพยากรธรรมชาติ (Faculty of Natural Resources)",
  "คณะอุตสาหกรรมเกษตร (Faculty of Agro-Industry)",
  "คณะการแพทย์แผนไทย (Faculty of Traditional Thai Medicine)"
] as const;

/** Sentinel value for the "other faculty" option. */
export const OTHER_FACULTY = "อื่นๆ (โปรดระบุ)";
