import Cookies from "js-cookie";

export const setTokenCookie = (token: string) => {
  Cookies.set("token", token, {
    expires: 1, // 1 hari
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
};

export const getTokenCookie = (): string | undefined => {
  return Cookies.get("token");
};

export const removeTokenCookie = () => {
  Cookies.remove("token");
};
