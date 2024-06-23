"use client";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const AUTH_REFRESH_URL = API_URL + "/v1/auth/refresh";
export const AUTH_ME_URL = API_URL + "/v1/auth/login";
export const SELF_USER_URL = API_URL + "/v1/users/self";
export const AUTH_LOGOUT_URL = API_URL + "/v1/auth/logout";
export const EMPLOYEE_URL = API_URL + "/v1/employees";
