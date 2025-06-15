import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { sign, unsign } from 'cookie-signature';

const CART_COOKIE = 'cart';

export const getCartFromCookies = async () => {
  const cart = await getCookie(CART_COOKIE); 
  const unsignedCart = cart ? unsign(cart as string, process.env.COOKIE_SECRET!) : false; 

  return unsignedCart ? JSON.parse(unsignedCart) : {}; 
};

export const setCartCookie = (cart: Record<string, number>) => {
  const signedCart = sign(JSON.stringify(cart), process.env.COOKIE_SECRET!);
  setCookie(CART_COOKIE, signedCart, { maxAge: 30 * 24 * 60 * 60 });
};

export const clearCartCookie = () => {
  deleteCookie(CART_COOKIE);
};