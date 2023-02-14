export default function useDateFormatter() {
  const formatDate = (date, format = 'en-US', formatOptions = {}) => {
    const d = new Date(date);
    try {
      return new Intl.DateTimeFormat(format, formatOptions).format(d);
    } catch {
      return '';
    }
  };

  const formatTime = value => new Date(value).toLocaleString();

  return {
    formatTime,
    formatDate,
  };
}
