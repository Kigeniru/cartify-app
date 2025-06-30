import pandan from '../../assets/dreamy-pandan.png';
import lemon from '../../assets/lemon-serenade.png';
import mango from '../../assets/tropical-mango.png';
import vanilla from '../../assets/vanilla-harmony.png';

const ProductData = [
  {
    id: 1,
    name: 'Vanilla Harmony',
    price: 700,
    description: 'Silky, custard dessert infused with warm vanilla and topped with a rich caramel glaze.',
    image: vanilla,
    bgColor: '#EFEFED',
    gradient: ['#FDEBD2', '#E8B87E'], // soft vanilla to rich caramel
  },
  {
    id: 2,
    name: 'Tropical Mango',
    price: 700,
    description: 'Creamy, tropical flan bursting with sweet mango flavor and crowned with golden caramel.',
    image: mango,
    bgColor: '#EFEFED',
    gradient: ['#FFF3C9', '#F9B233'], // light mango to deep mango-orange
  },
  {
    id: 3,
    name: 'Dreamy Pandan',
    price: 700,
    description: 'Creamy flan infused with the aromatic, grassy-sweet flavor of pandan and topped with golden caramel.',
    image: pandan,
    bgColor: '#EFEFED',
    gradient: ['#DAFFC3', '#6FB620'], // pastel green to deep pandan
  },
  {
    id: 4,
    name: 'Lemon Serenade',
    price: 700,
    description: 'Creamy flan infused with the aromatic, grassy-sweet flavor of pandan and topped with golden caramel.',
    image: lemon,
    bgColor: '#EFEFED',
    gradient: ['#FFFED1', '#E4C900'], // light lemon to bold yellow-gold
  },
];

export default ProductData;
