export const ALERT_TYPE = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  VALUES: () => Object.values(ALERT_TYPE),
}

export const SCROLL_TO = {
  TOP: Symbol,
  BOTTOM: Symbol,
  VALUES: () => Object.values(SCROLL_TO),
}
