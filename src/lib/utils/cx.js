/** Une clases condicionales: cx('a', on && 'b') */
export const cx = (...c) => c.filter(Boolean).join(' ');
