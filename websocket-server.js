"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// Updated server with Cobra VAD for end-of-speech detection
var express_1 = require("express");
var ws_1 = require("ws");
var http_1 = require("http");
var openai_1 = require("openai");
var ffmpeg_static_1 = require("ffmpeg-static");
var fluent_ffmpeg_1 = require("fluent-ffmpeg");
var os_1 = require("os");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var fs_1 = require("fs");
var dotenv_1 = require("dotenv");
var cobra_node_1 = require("@picovoice/cobra-node");
dotenv_1.default.config();
var openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
var cobra = new cobra_node_1.Cobra(process.env.COBRA_ACCESS_KEY);
var app = (0, express_1.default)();
var server = http_1.default.createServer(app);
var wss = new ws_1.WebSocketServer({ server: server, path: "/media-stream" });
var audioBuffers = {};
var speechTimers = {};
var isSpeaking = {};
wss.on("connection", function (ws) {
    ws.on("message", function (msg) { return __awaiter(void 0, void 0, void 0, function () {
        var data, event, sessionId, sessionId_1, mulawChunk, pcmChunk, score;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    data = JSON.parse(msg.toString());
                    event = data.event;
                    if (event === "start") {
                        sessionId = (_b = (_a = data.start) === null || _a === void 0 ? void 0 : _a.customParameters) === null || _b === void 0 ? void 0 : _b.SessionId;
                        if (!sessionId)
                            return [2 /*return*/, ws.close()];
                        ws.sessionId = sessionId;
                        audioBuffers[sessionId] = [];
                        isSpeaking[sessionId] = false;
                    }
                    if (!(event === "media")) return [3 /*break*/, 2];
                    sessionId_1 = ws.sessionId;
                    if (!sessionId_1)
                        return [2 /*return*/];
                    mulawChunk = Buffer.from((_c = data.media) === null || _c === void 0 ? void 0 : _c.payload, "base64");
                    return [4 /*yield*/, convertMulawChunkToPcm(mulawChunk)];
                case 1:
                    pcmChunk = _d.sent();
                    score = cobra.process(pcmChunk);
                    if (score > 0.5) {
                        clearTimeout(speechTimers[sessionId_1]);
                        isSpeaking[sessionId_1] = true;
                        audioBuffers[sessionId_1].push(mulawChunk);
                    }
                    else if (isSpeaking[sessionId_1]) {
                        speechTimers[sessionId_1] = setTimeout(function () {
                            processAudio(sessionId_1, ws);
                            isSpeaking[sessionId_1] = false;
                        }, 800);
                    }
                    _d.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
    ws.on("close", function () { return console.log("❌ WebSocket closed"); });
});
app.use(function (req, res) {
    res.status(404).send("Not a WebSocket endpoint");
});
server.listen(process.env.PORT || 3001, function () {
    console.log("\u2705 WebSocket server running");
});
function convertMulawChunkToPcm(mulawBuffer) {
    return __awaiter(this, void 0, void 0, function () {
        var inputPath, outputPath;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inputPath = path_1.default.join((0, os_1.tmpdir)(), "".concat((0, crypto_1.randomUUID)(), ".ulaw"));
                    outputPath = path_1.default.join((0, os_1.tmpdir)(), "".concat((0, crypto_1.randomUUID)(), ".pcm"));
                    return [4 /*yield*/, promises_1.default.writeFile(inputPath, mulawBuffer)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (0, fluent_ffmpeg_1.default)()
                                .setFfmpegPath(ffmpeg_static_1.default)
                                .input(inputPath)
                                .inputOptions(["-f mulaw", "-ar 8000", "-ac 1"])
                                .outputOptions(["-f s16le", "-acodec pcm_s16le", "-ar 16000"])
                                .output(outputPath)
                                .on("end", function () { return __awaiter(_this, void 0, void 0, function () {
                                var data;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, promises_1.default.readFile(outputPath)];
                                        case 1:
                                            data = _a.sent();
                                            resolve(data);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .on("error", reject)
                                .run();
                        })];
            }
        });
    });
}
function processAudio(sessionId, ws) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, wavPath, transcription, text, aiResponse, reply, replyAudio, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    buffer = Buffer.concat(audioBuffers[sessionId] || []);
                    if (!buffer || buffer.length < 8000)
                        return [2 /*return*/];
                    audioBuffers[sessionId] = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, convertMulawToWav(buffer)];
                case 2:
                    wavPath = _a.sent();
                    return [4 /*yield*/, openai.audio.transcriptions.create({
                            model: "whisper-1",
                            file: (0, fs_1.createReadStream)(wavPath),
                        })];
                case 3:
                    transcription = _a.sent();
                    text = transcription.text.trim();
                    if (!text || text.length < 3)
                        return [2 /*return*/];
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: "gpt-4o",
                            messages: [
                                { role: "system", content: "You are a helpful assistant." },
                                { role: "user", content: text },
                            ],
                        })];
                case 4:
                    aiResponse = _a.sent();
                    reply = aiResponse.choices[0].message.content;
                    return [4 /*yield*/, synthesizeWithOpenAI(reply)];
                case 5:
                    replyAudio = _a.sent();
                    sendAudioOverWebSocket(ws, replyAudio);
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.error("❌ Error:", err_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function convertMulawToWav(buffer) {
    return __awaiter(this, void 0, void 0, function () {
        var inputPath, outputPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inputPath = path_1.default.join((0, os_1.tmpdir)(), "".concat((0, crypto_1.randomUUID)(), ".ulaw"));
                    outputPath = path_1.default.join((0, os_1.tmpdir)(), "".concat((0, crypto_1.randomUUID)(), ".wav"));
                    return [4 /*yield*/, promises_1.default.writeFile(inputPath, buffer)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (0, fluent_ffmpeg_1.default)()
                                .setFfmpegPath(ffmpeg_static_1.default)
                                .input(inputPath)
                                .inputOptions(["-f mulaw", "-ar 8000", "-ac 1"])
                                .audioCodec("pcm_s16le")
                                .output(outputPath)
                                .on("end", function () { return resolve(outputPath); })
                                .on("error", reject)
                                .run();
                        })];
            }
        });
    });
}
function synthesizeWithOpenAI(text) {
    return __awaiter(this, void 0, void 0, function () {
        var response, audioBuffer, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, openai.audio.speech.create({
                        model: "gpt-4o-mini-tts",
                        voice: "nova",
                        input: text,
                        response_format: "mp3",
                    })];
                case 1:
                    response = _c.sent();
                    _b = (_a = Buffer).from;
                    return [4 /*yield*/, response.arrayBuffer()];
                case 2:
                    audioBuffer = _b.apply(_a, [_c.sent()]);
                    return [4 /*yield*/, convertToMulaw(audioBuffer)];
                case 3: return [2 /*return*/, _c.sent()];
            }
        });
    });
}
function convertToMulaw(input) {
    return __awaiter(this, void 0, void 0, function () {
        var inputPath, outputPath;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inputPath = path_1.default.join((0, os_1.tmpdir)(), "".concat((0, crypto_1.randomUUID)(), ".mp3"));
                    outputPath = path_1.default.join((0, os_1.tmpdir)(), "".concat((0, crypto_1.randomUUID)(), ".ul"));
                    return [4 /*yield*/, promises_1.default.writeFile(inputPath, input)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            (0, fluent_ffmpeg_1.default)()
                                .setFfmpegPath(ffmpeg_static_1.default)
                                .input(inputPath)
                                .audioCodec("pcm_mulaw")
                                .audioFrequency(8000)
                                .audioChannels(1)
                                .outputOptions(["-f mulaw"])
                                .output(outputPath)
                                .on("end", function () { return __awaiter(_this, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = resolve;
                                        return [4 /*yield*/, promises_1.default.readFile(outputPath)];
                                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                                }
                            }); }); })
                                .on("error", reject)
                                .run();
                        })];
            }
        });
    });
}
function sendAudioOverWebSocket(ws, buffer) {
    return __awaiter(this, void 0, void 0, function () {
        var chunkSize, streamSid, i, chunk;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chunkSize = 320;
                    streamSid = ws.streamSid;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < buffer.length)) return [3 /*break*/, 4];
                    chunk = buffer.slice(i, i + chunkSize);
                    ws.send(JSON.stringify({
                        event: "media",
                        streamSid: streamSid,
                        media: { payload: chunk.toString("base64") },
                    }));
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 20); })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i += chunkSize;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 2000); })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
