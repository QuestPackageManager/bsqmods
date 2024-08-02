export const isQavs =
  location.href
    .split("?")
    ?.at(1)
    ?.match(/(?:^|&)isqavs=(true|false)(?:$|&)/)
    ?.at(1) === "true";
