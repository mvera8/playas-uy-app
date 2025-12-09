// lib/getImage.js

export function getImage(imageName) {
  const images = {
    yellow: require('../assets/flag_yellow.png'),
    red: require('../assets/flag_red.png'),
    green: require('../assets/flag_green.png'),
    default: require('../assets/flag_close.png'),
  };

  return images[imageName] || images.default;
}

// Uso en tu componente:
// import { getImage } from '../utils/getImage';
// 
// <Image source={getImage(product.image)} style={styles.image} />