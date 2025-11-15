"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const guest_routes_1 = __importDefault(require("./routes/guest.routes"));
const gallery_routes_1 = __importDefault(require("./routes/gallery.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use("/guests", guest_routes_1.default);
app.use("/gallery", gallery_routes_1.default);
exports.default = app;
