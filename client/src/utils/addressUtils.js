// 주소 관련 순수 유틸리티 함수 모음

/**
 * 기본 배송지를 맨 앞에, 이후 order 오름차순으로 정렬한다.
 * @param {Array} list 주소 배열
 * @returns {Array} 정렬된 주소 배열 (원본 불변)
 */
export const sortAddresses = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });
};

/**
 * 기본 배송지를 반환한다. 없으면 첫 번째 주소, 그것도 없으면 null.
 * @param {Array} addresses 주소 배열
 * @returns {object|null}
 */
export const findDefaultAddress = (addresses) => {
  if (!Array.isArray(addresses) || addresses.length === 0) return null;
  return addresses.find((a) => a.isDefault) || addresses[0];
};

/**
 * 주소 객체가 유효한지(label과 address가 모두 비어 있지 않은지) 검사한다.
 * @param {object} addr
 * @returns {string|null} 오류 메시지 또는 null
 */
export const validateAddressForm = ({ label = "", address = "" }) => {
  if (!label.trim()) return "주소 별칭을 입력해주세요.";
  if (!address.trim()) return "배송 주소를 입력해주세요.";
  return null;
};
