/**
 * 상품·주문 가격은 DB에 원(KRW) 단위로 저장된다.
 * (숫자 또는 "123456", "123456.00" 형태 문자열)
 */
export const parseKrwAmount = (value) => {
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .trim();
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

export const formatKrw = (value) =>
  `${Math.round(parseKrwAmount(value)).toLocaleString("ko-KR")}원`;

export const formatKrwCompact = (value) =>
  `${new Intl.NumberFormat("ko-KR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(parseKrwAmount(value))}원`;
