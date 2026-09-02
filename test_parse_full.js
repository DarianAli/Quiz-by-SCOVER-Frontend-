"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var content_parser_1 = require("./lib/content-parser");
var raw = 'Jajaran genjang PQRS memiliki luas 20\n\n![](/question_image/abc.png){width="1in"}\n\nNext line';
console.log(JSON.stringify((0, content_parser_1.parseContent)(raw), null, 2));
