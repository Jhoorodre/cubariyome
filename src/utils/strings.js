// Utilitários para manipulação de strings e CSS

export const capitalizeFirstLetters = (sentence) => {
  if (!sentence) return "";
  return sentence
    .split(" ")
    .filter(Boolean)
    .map((str) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1))
    .join(" ");
};

export const trimSentence = (sentence, length) => {
  if (!sentence) return "";
  return sentence.slice(0, length) + (sentence.length > length ? "..." : "");
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Novos utilitários
export const slugify = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .trim();
};

export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export const sanitizeSearchQuery = (query) => {
  return query?.trim().replace(/[<>]/g, "") || "";
};
