import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const cssMinifier = postcss([autoprefixer, cssnano]);

export default cssMinifier;
