import { parseContent } from './lib/content-parser';
const raw = 'Jajaran genjang PQRS memiliki luas 20\n\n![](/question_image/abc.png){width="1in"}\n\nNext line';
console.log(JSON.stringify(parseContent(raw), null, 2));
